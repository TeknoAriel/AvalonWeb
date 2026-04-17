# Capa de datos — relevamiento JSON Kiteprop (externalsite)

**Condición crítica (inventario Premier, mapper API, reglas de descarte):** ver **`docs/PREMIER_INVENTORY_INVARIANT.md`** — obligatorio antes de cambiar `premier.ts`, `site-properties.ts`, `kiteprop-api-mapper.ts` o la carga del feed en Premier.

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

**Regla de negocio**: solo entran al sitio Premier las propiedades cuyo raw pasa `hasPremierTag` (típicamente tag literal `premier` en `tags[]`, string CSV, flags CRM, etc.); el resto se descarta del listado Premier y permanece en Avalon Propiedades.

La función `hasPremierTag` reconoce, entre otras:

- `tags` / `labels` / `categories` como array, string (CSV o JSON stringificado), u objeto con `name`, `slug`, `label`, etc.
- Claves adicionales típicas de CRM: `property_tags`, `tag_names`, `tag_list`, `kp_tags`, `groups`, `collections`.
- Flags booleanos `premier` / `is_premier`, y strings en `segment`, `collection`, `tier`, `class`, `tag`, `tag_slug`.
- Overrides por `PREMIER_PROPERTY_IDS` / `NEXT_PUBLIC_PREMIER_PROPERTY_IDS`.

En **servidor**, `loadKitepropCatalogMerged` usa **solo** `GET …/properties` con **`KITEPROP_API_KEY`** / token cuando está configurado; luego `mergePremierMetadataFromRepoSnapshot` con `packages/core/data/properties.json`. Sin key o si la API falla → solo snapshot. **No** hay ingest por URL de JSON de difusión en runtime (evita desalineación con la API y tags Premier faltantes). Mapeo API: `kiteprop-api-mapper` + `enrich` (`docs/KITEPROP.md`). ISR **2 h**. [API v1](https://www.kiteprop.com/docs/api/v1).

El archivo `properties.json` del repo puede regenerarse manualmente desde un export JSON para **desarrollo o backup**; la app en producción no consume `KITEPROP_PROPERTIES_JSON_URL`.

## MCP vs visitante de la web

El **MCP** de KiteProp es para integraciones tipo Cursor; el público usa formularios → **`/api/consultas`** → REST con `X-API-Key` en servidor. Detalle de endpoints, env y archivos: **`docs/KITEPROP.md`** (referencia canónica).

## Amenities

No hay array dedicado. `extractAmenities` usa **solo campos booleanos y numéricos** (mascotas, permuta, crédito, cocheras, etc.). Si el export agrega amenities explícitas, extender `extractAmenities` en `packages/core/src/amenities.ts`.
