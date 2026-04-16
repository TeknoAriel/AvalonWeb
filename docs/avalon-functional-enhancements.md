# Mejoras funcionales — implementación técnica

## Resumen

Se añadió una capa **modular** (dominio en `@avalon/core`, persistencia y telemetría en `@avalon/utils`, UI en `@avalon/ui`, flags en `@avalon/config`) sin rediseñar layouts: favoritos, recientes, búsquedas guardadas, comparador con insights, relacionadas por scoring, filtros extendidos vía URL, intención de lead en consultas, búsqueda en lenguaje natural (heurística + MCP opcional), asistente breve en ficha, resumen de mercado local, curadura Premier opcional y rutas API `/api/ai/*`.

## Feature flags

Variable: `NEXT_PUBLIC_DISABLED_FEATURES` — lista separada por **comas** (sin espacios obligatorios). IDs:

`favorites`, `recents`, `saved_search`, `compare_insights`, `smart_related`, `nl_search`, `lead_intent`, `extended_filters`, `property_ask`, `market_summary`

Ejemplo: `NEXT_PUBLIC_DISABLED_FEATURES=nl_search,property_ask`

Implementación: `packages/config/src/features.ts` (`isFeatureEnabled`).

## Persistencia local (visitante)

- **Favoritos:** snapshots `{ id, slug, title, thumbUrl, subtitle }` en `localStorage` (`packages/utils/src/engagement.ts`). Evento `avalon:engagement:favorites`.
- **Recientes:** mismos campos + `viewedAt`, máx. 14. Evento `avalon:engagement:recents`. Escritura desde `PropertyViewTracker` en ficha.
- **Búsquedas guardadas:** `{ id, name, createdAt, query }` donde `query` es `URLSearchParams` serializado. Máx. 30.

**Remoto / usuario logueado:** no implementado; la forma de datos y eventos permite enganchar un servicio sin cambiar la UI.

## Dominio (core)

| Módulo | Archivo | Rol |
|--------|---------|-----|
| Métricas | `property-metrics.ts` | Precio venta numérico, m², amenity `credit`, precio/m² |
| Relacionadas | `related-scoring.ts` + `site-properties.ts` | `pickSmartRelated` por zona, ciudad, tipo, operación, precio, dormitorios, amenities |
| Comparador | `compare-insights.ts` | `buildCompareInsights` — bullets (menor precio, mayor m², mejor $/m², etc.) |
| Filtros URL | `list-filters-url.ts` + `filters.ts` | Params `minSale`, `maxSale`, `beds`, `baths`, `minM2`, `maxM2`, `parking`, `credit`, `zone` |
| NL local | `nl-search-heuristic.ts` | Patrones simples (dormitorios, cochera, crédito, tipo, ciudad, precios “hasta/desde”) |
| Resolver NL | `ai-resolve-search.ts` | Une heurística + respuesta opcional del **bridge MCP** |
| MCP bridge | `mcp-kiteprop-bridge.ts` | `POST` a `KITEPROP_MCP_BRIDGE_URL` con `{ tool, args }` si está configurado |
| QA ficha | `property-qa-local.ts` | Respuestas cortas sin LLM |
| Mercado | `market-summary-local.ts` | Mediana precio/m² por ciudad sobre listado del sitio |
| Premier | `premier-curation.ts` | Filtro extra en `getSitePropertiesFromRaw` para `site === 'premier'` |

## API Next (ambas apps)

- `POST /api/ai/parse-search` — body `{ q, cities? }` → `{ query, understood, usedMcpBridge }` (`query` listo para `?` en `/propiedades`).
- `POST /api/ai/property-assist` — body `{ propertyId, question }` → intenta `get_property` vía bridge; si no hay respuesta, `buildLocalPropertyQaAnswer`.

## CRM / mensajes

- `leadIntent` opcional en `POST /api/consultas` → `submitWebConsulta` → prefijo en cuerpo KiteProp (`kiteprop-consulta.ts`).
- El flujo REST existente (`messages` / `contacts`) equivale funcionalmente a **crear mensaje / lead**; no se expone MCP `create_message` al navegador.

## Telemetría

`trackAvalonEvent` en `packages/utils/src/analytics.ts` — empuja a `window.dataLayer` si existe; en desarrollo hace `console.debug`.

## Dependencias del feed

- Filtros numéricos y scoring fallan con elegancia si faltan precios (`hide_prices`) o m².
- `market_summary` solo muestra texto si `sampleSize >= 5` y hay mediana.
- Mapa: sin coordenadas, mensaje existente sin romper ficha.

## Riesgos y siguientes pasos

- **Bridge MCP:** contrato `{ tool, args }` / `{ ok, result }` debe alinearse con tu servidor intermedio o con la herramienta real de KiteProp.
- **NL:** la heurística no sustituye un modelo; para calidad máxima conectar bridge con `search_properties` real.
- **Búsquedas guardadas / alertas:** hoy solo local; alertas por email requieren backend y consentimiento.
