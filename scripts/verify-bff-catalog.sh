#!/usr/bin/env bash
# Prueba GET /api/internal/catalog en Avalon Web (misma auth que Premier).
# Requiere en el entorno (no commitear): INTERNAL_CATALOG_SECRET
# Opcional: AVALON_CATALOG_INTERNAL_URL (default https://avalonweb.vercel.app/api/internal/catalog)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SECRET="${CRON_SECRET:-${INTERNAL_CATALOG_SECRET:-}}"
URL="${AVALON_CATALOG_INTERNAL_URL:-https://avalonweb.vercel.app/api/internal/catalog}"
if [[ -z "$SECRET" ]]; then
  echo "Falta CRON_SECRET (recomendado) o INTERNAL_CATALOG_SECRET en el entorno." >&2
  echo "  export CRON_SECRET='…'   # el mismo valor que en Vercel Production" >&2
  echo "Opcional: export AVALON_CATALOG_INTERNAL_URL='https://<tu-avalonweb>/api/internal/catalog'" >&2
  exit 2
fi
echo "GET $URL"
code="$(curl -sS -o /tmp/avalon-bff-catalog-body.json -w "%{http_code}" \
  -H "Authorization: Bearer ${SECRET}" \
  -H "Accept: application/json" \
  "$URL")"
echo "HTTP $code"
if [[ "$code" != "200" ]]; then
  head -c 500 /tmp/avalon-bff-catalog-body.json 2>/dev/null | cat >&2 || true
  exit 1
fi
# Primer carácter no espacio debería ser [ o {
head -c 120 /tmp/avalon-bff-catalog-body.json | tr -d '\n'
echo ""
echo "OK (cuerpo guardado en /tmp/avalon-bff-catalog-body.json)"
