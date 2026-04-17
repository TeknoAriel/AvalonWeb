/**
 * Cloudflare (y reglas WAF) suelen bloquear requests sin User-Agent “de navegador”.
 * Usar en todo `fetch` server-side hacia `www.kiteprop.com`.
 */
export function kitepropOutboundUserAgent(): string {
  const custom =
    typeof process !== 'undefined' && process.env.KITEPROP_FETCH_USER_AGENT
      ? process.env.KITEPROP_FETCH_USER_AGENT.trim()
      : '';
  if (custom) return custom;
  return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';
}
