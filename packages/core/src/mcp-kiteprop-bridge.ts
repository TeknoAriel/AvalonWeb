/**
 * Puente opcional hacia herramientas tipo MCP / servidor intermedio KiteProp.
 * En producción pública la key **no** sale del servidor; si configurás un bridge,
 * debe ser una URL **server-to-server** controlada por vos.
 *
 * Variables:
 * - `KITEPROP_MCP_BRIDGE_URL` — POST JSON `{ tool, args }` → `{ ok, result }` (opcional)
 * - Timeout corto para no bloquear UX
 */

const MCP_TIMEOUT_MS = 8000;

export type McpToolName =
  | 'search_properties'
  | 'get_property'
  | 'create_message'
  | 'get_market_analysis';

export type McpInvokeResult<T> =
  | { ok: true; data: T; source: 'mcp_bridge' }
  | { ok: false; source: 'mcp_bridge' | 'unconfigured'; message?: string };

export async function invokeKitepropMcpTool<T>(
  tool: McpToolName,
  args: Record<string, unknown>,
): Promise<McpInvokeResult<T>> {
  const url = process.env.KITEPROP_MCP_BRIDGE_URL?.trim();
  if (!url) {
    return { ok: false, source: 'unconfigured' };
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), MCP_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, args }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) {
      return { ok: false, source: 'mcp_bridge', message: await res.text().catch(() => res.statusText) };
    }
    const payload = (await res.json()) as { ok?: boolean; result?: T; error?: string };
    if (!payload.ok || payload.result === undefined) {
      return {
        ok: false,
        source: 'mcp_bridge',
        message: typeof payload.error === 'string' ? payload.error : 'empty result',
      };
    }
    return { ok: true, data: payload.result, source: 'mcp_bridge' };
  } catch (e) {
    clearTimeout(t);
    const msg = e instanceof Error ? e.message : 'mcp fetch error';
    return { ok: false, source: 'mcp_bridge', message: msg };
  }
}
