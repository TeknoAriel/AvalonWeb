/**
 * Puente futuro para MCP / asistente (lenguaje natural, recomendaciones).
 * No implementa servidor MCP aquí: solo contratos para no acoplar la UI.
 */

export type NaturalLanguageIntent =
  | 'search_properties'
  | 'explain_property'
  | 'compare'
  | 'contact';

export interface KitepropMcpSearchParams {
  query: string;
  locale?: string;
}

export interface KitepropMcpAdapter {
  readonly version: string;
  searchProperties(params: KitepropMcpSearchParams): Promise<{ propertyIds: number[] }>;
}

/** Stub hasta conectar herramienta MCP real. */
export const kitepropMcpPlaceholder: KitepropMcpAdapter = {
  version: '0-placeholder',
  async searchProperties() {
    return { propertyIds: [] };
  },
};
