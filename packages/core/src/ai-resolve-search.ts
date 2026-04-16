import type { PropertyListFilters } from './filters';
import { invokeKitepropMcpTool } from './mcp-kiteprop-bridge';
import { interpretNaturalPropertySearch, type NaturalSearchInterpretation } from './nl-search-heuristic';

export type ResolvedNaturalSearch = NaturalSearchInterpretation & {
  usedMcpBridge: boolean;
};

/**
 * Heurística local + opcional puente MCP (`KITEPROP_MCP_BRIDGE_URL`).
 */
export async function resolveNaturalSearchInterpretation(
  q: string,
  cities: string[],
): Promise<ResolvedNaturalSearch> {
  const local = interpretNaturalPropertySearch(q, { cities });
  const bridge = await invokeKitepropMcpTool<{
    filters?: Partial<PropertyListFilters>;
    understood?: string[];
  }>('search_properties', { query: q });
  if (!bridge.ok || !bridge.data || typeof bridge.data !== 'object') {
    return { ...local, usedMcpBridge: false };
  }
  const extra = bridge.data.filters ?? {};
  const understoodExtra = Array.isArray(bridge.data.understood) ? bridge.data.understood : [];
  return {
    filters: { ...local.filters, ...extra },
    understood: [...local.understood, ...understoodExtra.filter((x) => typeof x === 'string')],
    usedMcpBridge: true,
  };
}
