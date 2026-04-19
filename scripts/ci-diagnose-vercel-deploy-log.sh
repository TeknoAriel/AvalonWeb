#!/usr/bin/env bash
# Lee el log del `vercel deploy` y emite avisos de Actions si parece tope de plan / rate limit.
# Uso: bash scripts/ci-diagnose-vercel-deploy-log.sh /ruta/al.log
# No hace exit distinto de 0 (solo informativo).
set -euo pipefail

LOG="${1:-}"
if [ -z "$LOG" ] || [ ! -f "$LOG" ]; then
  exit 0
fi

# Patrones comunes: API 429, mensajes de cuota, "too many" (idioma puede variar).
if grep -qiE \
  '(\b429\b|rate.?limit|too many requests|resource.?limit|quota exceeded|deployment.?limit|deployments? (per|/) ?day|exceeded.*(deploy|usage)|plan limit|upgrade (your|to) plan|hobby plan)' \
  "$LOG"; then
  echo "::notice title=Posible tope Vercel (plan / deploys / rate limit)::El log del CLI coincide con límites de uso o rate limit. **No asumas bug de la app.** Revisá Vercel → Team → Usage / Billing y la tabla oficial de tu plan: https://vercel.com/docs/plans/hobby (Hobby: deployments/día y otros topes; los números cambian con el tiempo). Si además deployás por Git y por Actions, cada uno cuenta deployments."
fi
