/**
 * Puente futuro para MCP / asistente (lenguaje natural, recomendaciones).
 *
 * **Cursor — MCP remoto KiteProp:** en Ajustes → MCP podés añadir un servidor con URL
 * `https://www.mcp.kiteprop.com` (transporte SSE/HTTP según indique KiteProp) y la misma API Key.
 *
 * **Cursor — MCP local (npm):** paquete publicado tipo `kiteprop-crm-mcp` (stdio) con variables
 * de entorno que indique el README del paquete (suelen ser URL base + token/key).
 *
 * Este archivo no arranca el servidor MCP; solo define contratos para la app.
 * Consultas del sitio web → `docs/KITEPROP.md` (REST vía Next, no MCP en el navegador).
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
