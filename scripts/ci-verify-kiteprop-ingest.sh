#!/usr/bin/env bash
# CI: ingesta completa vía KiteProp (misma lógica que producción). Requiere KITEPROP_API_KEY en el entorno.
# Sin key → aviso y exit 0 (no rompe forks sin secret).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -z "${KITEPROP_API_KEY:-}" ] && [ -z "${KITEPROP_API_TOKEN:-}" ]; then
  echo "::notice title=KiteProp CI::No hay KITEPROP_API_KEY ni KITEPROP_API_TOKEN en Secrets — se omite verificación live. Configurá el secret en el repo para bloquear regresiones de ingesta."
  exit 0
fi

export INGEST_STATS_OUT="${INGEST_STATS_OUT:-$ROOT/ingest-report.json}"
pnpm kp:ingest-stats

echo "::group::Resumen ingesta"
python3 << 'PY'
import json, os, sys
path = os.environ.get("INGEST_STATS_OUT", "ingest-report.json")
with open(path) as f:
    d = json.load(f)
print("totalRows:", d.get("totalRows"))
print("premierTagCount:", d.get("premierTagCount"))
print("premierListableCount:", d.get("premierListableCount"))
min_total = int(os.environ.get("MIN_INGEST_TOTAL_ROWS") or "1")
min_prem = os.environ.get("MIN_PREMIER_TAG_COUNT", "").strip()
if d.get("totalRows", 0) < min_total:
    print(f"::error::totalRows {d.get('totalRows')} < MIN_INGEST_TOTAL_ROWS {min_total}")
    sys.exit(1)
if min_prem:
    n = int(min_prem)
    if d.get("premierTagCount", 0) < n:
        print(f"::error::premierTagCount {d.get('premierTagCount')} < MIN_PREMIER_TAG_COUNT {n}")
        sys.exit(1)
print("OK ingesta KiteProp")
PY
echo "::endgroup::"
