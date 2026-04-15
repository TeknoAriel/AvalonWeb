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

## Push de consultas (mapa del código)

| Capa | Archivo | Rol |
|------|-----------|-----|
| UI (cliente) | `packages/ui/src/property-consulta-form.tsx` | Formulario; `fetch('/api/consultas', { body: { name, email, phone, message, propertyId } })`. Honeypot `website`. |
| Ficha Propiedades | `apps/avalon-propiedades/app/propiedades/[slug]/page.tsx` | Renderiza `<PropertyConsultaForm variant="avalon" propertyId={…} />` en el aside. |
| Ficha Premier | `apps/avalon-premier/app/propiedades/[slug]/page.tsx` | Mismo componente `variant="premier"` debajo de la descripción. |
| API Next | `apps/avalon-propiedades/app/api/consultas/route.ts` y `apps/avalon-premier/app/api/consultas/route.ts` | Valida JSON → llama `postConsultaToKiteprop` con `source` distinto por app. |
| CRM (salida) | `packages/core/src/kiteprop-consulta.ts` | `POST` a `KITEPROP_API_CONSULTA_URL` **o** `KITEPROP_API_BASE_URL` + `KITEPROP_API_CONSULTA_PATH`, cabecera **`X-API-Key`**, cuerpo hoy: `full_name`, `email`, `phone`, `body`, `property_id`, `source`. |

**Qué dice la doc pública indexada (v1):** hay **GET** de listados (p. ej. propiedades, mensajes asociados a difusiones) y respuestas de ejemplo para contactos; **no aparece en ese índice un POST documentado** para “alta de consulta desde sitio web”. El `KITEPROP_API_CONSULTA_*` debe confirmarse con **soporte KiteProp** o la sección exacta del portal de docs (si el POST existe pero con otra ruta/nombre de campos, se ajusta solo `kiteprop-consulta.ts`).

## Amenities

No hay array dedicado. `extractAmenities` usa **solo campos booleanos y numéricos** (mascotas, permuta, crédito, cocheras, etc.). Si el export agrega amenities explícitas, extender `extractAmenities` en `packages/core/src/amenities.ts`.
