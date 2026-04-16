# Racional de producto — Avalon Web vs Avalon Premier

## Avalon Web (catálogo general)

**Qué se suma para el usuario**

- **Favoritos y recientes:** retomar interés sin cuenta; reduce fricción cognitiva.
- **Guardar búsqueda:** misma URL en un clic; base para alertas futuras (precio, novedades, similares).
- **Filtros avanzados colapsados:** más poder sin recargar la pantalla principal de filtros.
- **Búsqueda en lenguaje natural:** entrada cómoda en móvil; el sistema muestra “qué entendió” y aplica filtros; si falla, los filtros clásicos siguen.
- **Comparador con insights:** decisiones rápidas (quién tiene mejor $/m², más dormitorios, etc.) sin tabla gigante.
- **Relacionadas:** dejan de ser “misma ciudad genérica”; priorizan zona, precio, tipo y amenities cuando el feed lo permite.
- **Intención en consulta:** el lead llega etiquetado en el CRM (prefijo en mensaje).
- **Preguntar por la propiedad:** respuestas breves con datos publicados; si hay bridge MCP, se puede enriquecer.

## Avalon Premier (colección curada)

Misma base técnica con énfasis en:

- Curadura **server-side** opcional (`PREMIER_MIN_GALLERY_IMAGES`, `PREMIER_MIN_TOTAL_M2`, `PREMIER_EXCLUDE_PROPERTY_IDS`) para no degradar la percepción premium si el feed trae ruido.
- Misma shortlist (favoritos), recientes y comparación asistida, con tono visual existente.

## MCP — qué se integró y qué no

**Integrado (solo servidor, nunca la API key en el cliente)**

- Puente genérico `invokeKitepropMcpTool` hacia `KITEPROP_MCP_BRIDGE_URL` para `search_properties` y `get_property` si configurás un servicio compatible.
- Sin bridge: **degradación** con heurística local (búsqueda) y `buildLocalPropertyQaAnswer` (ficha).

**No integrado en web pública**

- Herramientas de CRM interno, métricas de equipo, cambios de estado, difusiones operativas, etc.

**create_message**

- No se llama MCP desde el navegador; las consultas siguen yendo por `POST /api/consultas` a la REST KiteProp ya documentada (`messages` / `contacts`).

**get_market_analysis**

- No hay llamada MCP dedicada; el bloque “mercado” usa estadística **local** sobre el mismo catálogo público (mediana precio/m² por ciudad), con copy claro de que no es tasación.

## Por qué esta división

- **Seguridad:** MCP y API keys quedan en servidor o en un bridge controlado.
- **UX:** nada invasivo; componentes acotados y desactivables.
- **Mantenimiento:** dominio testeable en `core`; UI delgada.
