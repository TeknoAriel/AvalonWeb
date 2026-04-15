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

En **servidor**, si existe `KITEPROP_PROPERTIES_JSON_URL`, las apps Next cargan ese JSON (mismo esquema que `properties.json`) con revalidación; si no, usan el snapshot del repo.

## Amenities

No hay array dedicado. `extractAmenities` usa **solo campos booleanos y numéricos** (mascotas, permuta, crédito, cocheras, etc.). Si el export agrega amenities explícitas, extender `extractAmenities` en `packages/core/src/amenities.ts`.
