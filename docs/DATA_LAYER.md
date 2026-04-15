# Capa de datos — relevamiento JSON Kiteprop (externalsite)

Fuente analizada: array de propiedades con **57 claves** de primer nivel en el export actual.

## Campos principales

| Área | Campos |
|------|--------|
| Identidad | `id`, `url`, `title`, `status`, `last_update` |
| Texto | `content` (HTML con entidades) |
| Ubicación | `address`, `city`, `region`, `country`, `zone`, `zone_2`, `postcode`, `latitude`, `longitude`, `hide_exact_location` |
| Tipología | `property_type`, `property_type_old`, habitaciones y baños, `total_meters`, `covered_meters`, `uncovered_meters`, etc. |
| Operación | `for_sale`, `for_rent`, `for_temp_rental`, precios asociados, `currency`, `hide_prices`, `expenses` |
| Media | `images[]` → `{ url, title }`, `link_youtube`, `link_360_iframe` |
| Agente | `agent`, `agency` |

## Tipos de propiedad observados

`apartments`, `houses`, `residential_lands`, `retail_spaces`, `offices`, `farms`, `parking_spaces`, `warehouses`.

## Estados (`status`)

Ejemplos en el lote completo: `active`, `inactive`, `suspended`, `sold`, `reserved`, `rented`, `active_unpublished`.  
**Listado público**: filtramos `active` únicamente (ajustable en `isPubliclyListed`).

## Tags Premier

La función `hasPremierTag` reconoce, entre otras:

- `tags` / `labels` / `categories` como array, string (CSV o JSON stringificado), u objeto con `name`, `slug`, `label`, etc.
- Claves adicionales típicas de CRM: `property_tags`, `tag_names`, `tag_list`, `kp_tags`, `groups`, `collections`.
- Flags booleanos `premier` / `is_premier`, y strings en `segment`, `collection`, `tier`, `class`, `tag`, `tag_slug`.
- Overrides por `PREMIER_PROPERTY_IDS` / `NEXT_PUBLIC_PREMIER_PROPERTY_IDS`.

En **servidor**, el orden de carga es: `KITEPROP_PROPERTIES_JSON_URL` (JSON del export) → si no hay URL, **API** `GET …/properties` con `KITEPROP_API_KEY` / `KITEPROP_API_TOKEN` como **`X-API-Key`** (ver [docs API v1](https://www.kiteprop.com/docs/api/v1)) → si falla, snapshot `properties.json` del repo. El mapeo API→`RawProperty` vive en `@avalon/core` (`kiteprop-api-mapper`).

**JSON de difusión estática** (`static.kiteprop.com/.../externalsite-....json`): conviene declararlo en Vercel como `KITEPROP_PROPERTIES_JSON_URL` en **avalonweb** y **avalon-premier** (misma URL en ambos si comparten export). Así el catálogo sigue al export sin depender solo del snapshot del repo.

## MCP (`mcp.kiteprop.com`) vs visitante de la web

- **MCP** está pensado para **clientes con protocolo MCP** (p. ej. Cursor): herramientas para quien *desarrolla o opera* el CRM, no para que el navegador del público “se conecte” al MCP.
- **Mejor UX para quien navega el sitio:** formularios y CTAs que llamen a **rutas API propias** (Next) que por detrás usen la **REST de KiteProp** con `X-API-Key` (consultas, leads, agendar) según los endpoints que documente [API v1](https://www.kiteprop.com/docs/api/v1/). Opcional: un asistente en la web que use *las mismas operaciones* que expondría el MCP, pero **solo vía tu backend** (nunca pegar la key en el cliente).

## Push de consultas

- **Rutas Next:** `POST /api/consultas` en `avalon-propiedades` y `avalon-premier` (validación básica + honeypot en el formulario UI).
- **Core:** `postConsultaToKiteprop` (`@avalon/core`) reenvía con `X-API-Key` a `KITEPROP_API_CONSULTA_URL` **o** `KITEPROP_API_BASE_URL` + `KITEPROP_API_CONSULTA_PATH`.
- **Pendiente en tu entorno:** definir la URL/path y el **JSON exacto** que exija KiteProp para el POST (ajustar `kiteprop-consulta.ts` si los nombres de campo difieren de `full_name`, `email`, `phone`, `body`, `property_id`, `source`).

## Amenities

No hay array dedicado. `extractAmenities` usa **solo campos booleanos y numéricos** (mascotas, permuta, crédito, cocheras, etc.). Si el export agrega amenities explícitas, extender `extractAmenities` en `packages/core/src/amenities.ts`.
