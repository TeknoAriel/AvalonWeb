#!/usr/bin/env bash
# Verifica que GET /api/cron/refresh-catalog responda 200 + ok en producción (Vercel Cron hace lo mismo).
# Requiere: CRON_SECRET, PRODUCTION_URL_AVALON_WEB, PRODUCTION_URL_AVALON_PREMIER (origen https sin barra final).
# Si falta alguno → aviso y exit 0 (no falla CI opcional).
set -euo pipefail

SECRET="${CRON_SECRET:-}"
AVALON="${PRODUCTION_URL_AVALON_WEB:-}"
PREMIER="${PRODUCTION_URL_AVALON_PREMIER:-}"

if [ -z "$SECRET" ] || [ -z "$AVALON" ] || [ -z "$PREMIER" ]; then
  echo "::notice title=Cron producción::Falta CRON_SECRET y/o PRODUCTION_URL_AVALON_WEB y/o PRODUCTION_URL_AVALON_PREMIER — se omite smoke del cron remoto."
  exit 0
fi

verify_one() {
  local base="$1"
  local name="$2"
  local url="${base%/}/api/cron/refresh-catalog"
  echo "GET $url ($name)"
  local code body
  body="$(curl -sS -w "\n%{http_code}" -H "Authorization: Bearer ${SECRET}" -H "Accept: application/json" "$url")" || true
  code="$(echo "$body" | tail -n1)"
  body="$(echo "$body" | sed '$d')"
  if [ "$code" != "200" ]; then
    echo "::error::$name cron HTTP $code — $body"
    return 1
  fi
  if ! echo "$body" | grep -q '"ok"[[:space:]]*:[[:space:]]*true'; then
    echo "::error::$name cuerpo sin ok:true — $body"
    return 1
  fi
  echo "OK $name"
}

verify_one "$AVALON" "avalonweb"
verify_one "$PREMIER" "avalon-premier"
echo "::notice::Cron smoke producción OK (revalidación aceptada; no garantiza que KiteProp haya respondido en ese instante)."
