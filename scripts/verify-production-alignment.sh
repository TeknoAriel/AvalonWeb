#!/usr/bin/env bash
# Cadena producción: ingest local (KiteProp) → BFF avalonweb → cron ambos sitios.
# Exportá en la misma sesión (valores reales, sin placeholders):
#   KITEPROP_API_KEY
#   opcional: KITEPROP_API_URL o KITEPROP_API_BASE_URL
#   CRON_SECRET
#   PRODUCTION_URL_AVALON_WEB   (ej. https://avalonweb.vercel.app)
#   PRODUCTION_URL_AVALON_PREMIER (ej. https://avalon-premier.vercel.app)
#
# Uso: bash scripts/verify-production-alignment.sh
#      pnpm prod:verify-alignment
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== 1) Ingest local (KiteProp, mismo cliente que el servidor) ==="
if [ -z "${KITEPROP_API_KEY:-}" ] && [ -z "${KITEPROP_API_TOKEN:-}" ]; then
  echo "::error::Falta KITEPROP_API_KEY (o KITEPROP_API_TOKEN) en el entorno."
  exit 2
fi
pnpm kp:ingest-stats

echo ""
echo "=== 2) BFF GET /api/internal/catalog (Avalon Web producción) ==="
if [ -z "${CRON_SECRET:-}" ] || [ -z "${PRODUCTION_URL_AVALON_WEB:-}" ]; then
  echo "::notice::Omitido: definí CRON_SECRET y PRODUCTION_URL_AVALON_WEB para probar el BFF."
else
  BFF="${PRODUCTION_URL_AVALON_WEB%/}/api/internal/catalog"
  TMP="$(mktemp)"
  trap 'rm -f "$TMP"' EXIT
  code=$(curl -sS -o "$TMP" -w '%{http_code}' --max-time 120 \
    -H "Authorization: Bearer ${CRON_SECRET}" \
    -H "Accept: application/json" \
    "$BFF" || echo 000)
  if [ "$code" != "200" ]; then
    echo "::error::BFF HTTP $code — $BFF"
    head -c 600 "$TMP" >&2 || true
    echo "" >&2
    exit 1
  fi
  python3 <<PY
import json
with open("$TMP", "r", encoding="utf-8") as f:
    d = json.load(f)
if isinstance(d, list):
    print(f"BFF OK: {len(d)} filas raw (debe ser del orden de totalRows del ingest).")
else:
    print(f"BFF respuesta no es lista: {type(d).__name__}")
PY
fi

echo ""
echo "=== 3) Cron GET /api/cron/refresh-catalog (ambos proyectos) ==="
if [ -z "${CRON_SECRET:-}" ] || [ -z "${PRODUCTION_URL_AVALON_WEB:-}" ] || [ -z "${PRODUCTION_URL_AVALON_PREMIER:-}" ]; then
  echo "::notice::Omitido: definí CRON_SECRET, PRODUCTION_URL_AVALON_WEB y PRODUCTION_URL_AVALON_PREMIER (o ejecutá: pnpm ci:verify-cron-prod)."
  exit 0
fi
exec bash scripts/ci-verify-production-cron.sh
