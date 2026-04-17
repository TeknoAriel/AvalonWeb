#!/usr/bin/env python3
"""
Auditoría local del listado GET /properties (misma familia que `fetchKitepropPropertyFeedAsRaw`).
Requiere en el entorno (no commitear): KP_KEY o KITEPROP_API_KEY o KITEPROP_API_TOKEN.

Uso:
  export KP_KEY='kp_...'
  python3 scripts/verify_kiteprop_api_premier.py

Opcional (alineado con el core):
  export KITEPROP_API_BASE_URL=https://www.kiteprop.com/api/v1
  export KITEPROP_API_PROPERTIES_PATH=/properties
  export KITEPROP_API_STATUS_FILTER=active
  export KITEPROP_API_PER_PAGE=50
"""
from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from typing import Any

PREMIER_WORD = re.compile(r"\bpremier\b", re.I)


def env_key() -> str:
    return (
        (os.environ.get("KP_KEY") or "").strip()
        or (os.environ.get("KITEPROP_API_KEY") or "").strip()
        or (os.environ.get("KITEPROP_API_TOKEN") or "").strip()
    )


def api_base() -> str:
    return (os.environ.get("KITEPROP_API_BASE_URL") or "https://www.kiteprop.com/api/v1").rstrip("/")


def props_path() -> str:
    p = (os.environ.get("KITEPROP_API_PROPERTIES_PATH") or "/properties").strip()
    return p if p.startswith("/") else f"/{p}"


def per_page() -> int:
    try:
        n = int(os.environ.get("KITEPROP_API_PER_PAGE") or "50", 10)
    except ValueError:
        n = 50
    return max(10, min(100, n))


def status_filter() -> str:
    return (os.environ.get("KITEPROP_API_STATUS_FILTER") or "active").strip()


def fetch_page(base: str, path: str, key: str, page: int, per: int, status: str) -> dict[str, Any]:
    qs = urllib.parse.urlencode({"page": str(page), "per_page": str(per), "status": status})
    url = f"{base}{path}?{qs}"
    req = urllib.request.Request(
        url,
        headers={"X-API-Key": key, "Accept": "application/json"},
        method="GET",
    )
    with urllib.request.urlopen(req, timeout=90) as resp:
        return json.loads(resp.read().decode("utf-8"))


def extract_rows(payload: dict[str, Any]) -> list[dict[str, Any]]:
    data = payload.get("data")
    if isinstance(data, list):
        return [x for x in data if isinstance(x, dict)]
    return []


def pagination(payload: dict[str, Any]) -> tuple[int, int]:
    pag = payload.get("pagination") if isinstance(payload.get("pagination"), dict) else {}
    try:
        last = max(1, int(pag.get("last_page") or 1))
    except (TypeError, ValueError):
        last = 1
    try:
        cur = max(1, int(pag.get("current_page") or 1))
    except (TypeError, ValueError):
        cur = 1
    return last, cur


def scan_strings_for_premier(obj: Any) -> bool:
    if obj is None:
        return False
    if isinstance(obj, str):
        return bool(PREMIER_WORD.search(obj))
    if isinstance(obj, (int, float, bool)):
        return False
    if isinstance(obj, list):
        return any(scan_strings_for_premier(x) for x in obj)
    if isinstance(obj, dict):
        return any(scan_strings_for_premier(v) for v in obj.values())
    return False


def row_premier_heuristic(row: dict[str, Any]) -> bool:
    """Aproxima `hasPremierTag` (tags/labels/categories + flags + property_tags.name, etc.)."""
    if row.get("premier") is True or row.get("is_premier") is True:
        return True
    for k in ("tags", "labels", "categories", "property_tags", "kp_tags", "tag_list", "tag_names"):
        v = row.get(k)
        if v is None:
            continue
        if isinstance(v, list):
            for item in v:
                if isinstance(item, str) and (item.strip().lower() == "premier" or PREMIER_WORD.search(item)):
                    return True
                if isinstance(item, dict):
                    for sk in ("name", "slug", "label", "title", "key", "code", "value"):
                        s = item.get(sk)
                        if isinstance(s, str) and PREMIER_WORD.search(s):
                            return True
        elif isinstance(v, str) and PREMIER_WORD.search(v):
            return True
    return scan_strings_for_premier({k: row[k] for k in row if k in ("segment", "collection", "difusion_tags")})


def main() -> int:
    key = env_key()
    if not key:
        print(
            "Falta clave en el entorno del proceso hijo.\n"
            "  Usá: export KP_KEY='kp_…'   (solo KP_KEY=… sin «export» no la ven pnpm/python).\n"
            "  O: export KITEPROP_API_KEY=… / KITEPROP_API_TOKEN=…\n"
            "No commitees la key; .env.local está en .gitignore.",
            file=sys.stderr,
        )
        return 2

    base = api_base()
    path = props_path()
    per = per_page()
    status = status_filter()

    print("=== KiteProp API — auditoría de listado ===")
    print(f"Base: {base}{path}")
    print(f"status={status!r} per_page={per}")
    print()

    all_rows: list[dict[str, Any]] = []
    last_page = 1
    try:
        p1 = fetch_page(base, path, key, 1, per, status)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")[:800]
        print(f"HTTP {e.code} al pedir página 1:\n{body}", file=sys.stderr)
        return 1
    except urllib.error.URLError as e:
        print(f"Error de red: {e}", file=sys.stderr)
        return 1

    last_page, _ = pagination(p1)
    all_rows.extend(extract_rows(p1))

    for page in range(2, last_page + 1):
        try:
            pn = fetch_page(base, path, key, page, per, status)
        except urllib.error.HTTPError as e:
            print(f"HTTP {e.code} página {page}", file=sys.stderr)
            return 1
        all_rows.extend(extract_rows(pn))

    st = Counter(str(r.get("status") or "").strip().lower() or "(vacío)" for r in all_rows)
    premier_ids_set: set[int] = set()
    for r in all_rows:
        try:
            rid = int(r["id"])
        except (TypeError, ValueError):
            continue
        if row_premier_heuristic(r):
            premier_ids_set.add(rid)
    premier_ids = sorted(premier_ids_set)

    deep_ids_set: set[int] = set()
    for r in all_rows:
        try:
            rid = int(r["id"])
        except (TypeError, ValueError):
            continue
        if scan_strings_for_premier(r) and not row_premier_heuristic(r):
            deep_ids_set.add(rid)
    deep_ids = sorted(deep_ids_set)

    print(f"Páginas: 1..{last_page} | Filas en esta corrida: {len(all_rows)}")
    print("Por status (solo este lote / filtro):")
    for k, v in sorted(st.items(), key=lambda x: (-x[1], x[0])):
        print(f"  {k!r}: {v}")
    print()
    print(f"Filas con señal Premier (heurística tags/flags/property_tags): {len(premier_ids)}")
    if premier_ids:
        print("  IDs:", sorted(premier_ids))
    else:
        print("  (ninguna en este lote con el filtro actual)")
    if deep_ids:
        print(f"Filas con string 'premier' en algún valor JSON pero no captadas arriba: {len(deep_ids)}")
        print("  IDs (revisar manual):", sorted(deep_ids)[:50])

    print()
    print("Muestra tags/property_tags de las primeras 5 filas:")
    for r in all_rows[:5]:
        rid = r.get("id")
        print(f"  id={rid} tags={json.dumps(r.get('tags'), ensure_ascii=False)[:120]}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
