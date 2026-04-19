#!/usr/bin/env bash
# Verificación tras deploy (CI o local): HTTP 200 en rutas críticas y, si hay secreto, BFF de catálogo.
#
# Variables:
#   DEPLOY_URL_WEB       — URL del deploy de Avalon Web (sin / final)
#   DEPLOY_URL_PREMIER   — URL del deploy de Avalon Premier
#   POST_DEPLOY_CRON_SECRET — opcional; GET /api/internal/catalog con Bearer (= CRON_SECRET en Vercel Web)
#   POST_DEPLOY_MIN_CATALOG_ROWS — mínimo de filas en el JSON del BFF (default 1)
#
set -euo pipefail

WEB="${DEPLOY_URL_WEB:-}"
PREMIER="${DEPLOY_URL_PREMIER:-}"
SECRET="${POST_DEPLOY_CRON_SECRET:-}"
MIN_ROWS="${POST_DEPLOY_MIN_CATALOG_ROWS:-1}"

if [ -z "$WEB" ] || [ -z "$PREMIER" ]; then
  echo "::error::Faltan DEPLOY_URL_WEB y/o DEPLOY_URL_PREMIER"
  exit 1
fi

check_urls_200() {
  local ok=true code url
  for url in "${WEB%/}/" "${WEB%/}/propiedades" "${PREMIER%/}/" "${PREMIER%/}/propiedades"; do
    code=$(curl -sSL -o /dev/null -w '%{http_code}' --max-time 35 "$url" 2>/dev/null || echo 000)
    if [ "$code" != "200" ]; then
      echo "  pendiente HTTP $code — $url"
      ok=false
    fi
  done
  if $ok; then
    echo "::notice::Rutas públicas OK (/, /propiedades en Web y Premier)"
    return 0
  fi
  return 1
}

echo "=== Post-deploy: rutas públicas (reintentos compartidos) ==="
for i in $(seq 1 22); do
  if check_urls_200; then
    break
  fi
  if [ "$i" -eq 22 ]; then
    echo "::error::Tras 22 intentos (~3–4 min) alguna ruta no respondió 200. Revisá el log de build en Vercel y que el deploy no esté en error."
    exit 1
  fi
  echo "  reintento $i/22 en 10s…"
  sleep 10
done

if [ -n "$SECRET" ]; then
  echo "=== Post-deploy: BFF catálogo (Avalon Web) ==="
  url="${WEB%/}/api/internal/catalog"
  body_file="$(mktemp)"
  trap 'rm -f "$body_file"' EXIT
  code=$(curl -sS -o "$body_file" -w '%{http_code}' --max-time 120 \
    -H "Authorization: Bearer ${SECRET}" \
    -H "Accept: application/json" "$url" || echo 000)
  if [ "$code" != "200" ]; then
    echo "::error::BFF /api/internal/catalog HTTP $code. Primeras 800 bytes:"
    head -c 800 "$body_file" >&2 || true
    echo "" >&2
    echo "::notice::401 → Bearer distinto al CRON_SECRET del proyecto Web. 503 → falta CRON_SECRET o KiteProp no configurado."
    exit 1
  fi
  n=$(python3 -c "import json,sys; d=json.load(open(sys.argv[1])); print(len(d) if isinstance(d,list) else -1)" "$body_file")
  if ! [[ "$n" =~ ^[0-9]+$ ]] || [ "$n" -lt 0 ]; then
    echo "::error::BFF: JSON no es un array de propiedades."
    exit 1
  fi
  if [ "$n" -lt "$MIN_ROWS" ]; then
    echo "::error::Catálogo BFF con $n filas < mínimo $MIN_ROWS (variable repo POST_DEPLOY_MIN_CATALOG_ROWS). Revisá KITEPROP_API_KEY y feed en Vercel Web."
    exit 1
  fi
  echo "::notice::BFF catálogo OK: $n propiedades raw (umbral $MIN_ROWS)"
else
  echo "::notice::Sin POST_DEPLOY_CRON_SECRET en CI — se omite GET /api/internal/catalog (agregá secret CRON_SECRET al repo para validar el BFF tras cada deploy)."
fi

echo "::notice::Post-deploy verify OK."
