# KiteProp — referencia única (Avalon)

Documento canónico para **variables de entorno**, **lectura de catálogo** y **envío de consultas al CRM**. Evita duplicar reglas en otros archivos: si algo cambia, actualizá acá y enlazá desde README o brief.

## Enlaces oficiales

- [API v1 — documentación](https://www.kiteprop.com/docs/api/v1)
- Blog KiteProp: artículo sobre **vincular la web por API** y habilitación de API en el CRM (buscar en el sitio si la URL cambia).

## Seguridad

- La **API key** solo en **servidor** (Vercel / `.env.local`). Nunca en el cliente ni en `NEXT_PUBLIC_*`.
- El navegador llama a **`/api/consultas`** de la app; Next valida y llama a KiteProp con `X-API-Key`.

## Variables de entorno (resumen)

| Variable | Uso |
|----------|-----|
| `KITEPROP_PROPERTIES_JSON_URL` | JSON de difusión (prioridad sobre API y snapshot). Misma URL en ambas apps si comparten export. |
| `KITEPROP_API_KEY` o `KITEPROP_API_TOKEN` | `X-API-Key` en REST (listado `GET …/properties` y POST de consultas). |
| `KITEPROP_API_BASE_URL` | Base del listado API; default `https://www.kiteprop.com/api/v1`. Opcionales: `KITEPROP_API_PROPERTIES_PATH`, `KITEPROP_API_STATUS_FILTER`, `KITEPROP_API_PER_PAGE`. |
| `KITEPROP_API_URL` | Host **sin** `/api/v1` para POST de consultas (ej. `https://www.kiteprop.com`). Si no está, se deduce de `KITEPROP_API_BASE_URL`. |
| `KITEPROP_API_CONSULTA_URL` | **Opcional.** Si está definida, **todas** las consultas van a esa URL con cuerpo **legacy** (`full_name`, `body`, `property_id`, etc.). Solo para tenants con endpoint distinto acordado con soporte. |

Copiá valores concretos desde `.env.example` (comentado) en cada app o en Vercel.

## Consultas web → CRM

| Caso | Endpoint (tras `{host}` = `KITEPROP_API_URL` o deducido) | Cuerpo relevante |
|------|---------------------------|------------------|
| Ficha de propiedad | `POST {host}/api/v1/messages` | `email`, `body`, `property_id` (ID numérico en KiteProp, el mismo `id` del feed; **no** código KP salvo capa que traduzca). Nombre y teléfono van al pie de `body` en nuestra implementación. |
| Contacto general (sin ficha) | `POST {host}/api/v1/contacts` | `first_name`, `email`, `summary`; opcionales `last_name`, `phone`, `source` (enviamos `avalon-propiedades` / `avalon-premier` según la app). |

Implementación: `postConsultaToKiteprop` en `packages/core/src/kiteprop-consulta.ts`. Validación y orquestación del POST HTTP: `submitWebConsulta` en `packages/core/src/consultas-submission.ts`. Rutas Next: `apps/*/app/api/consultas/route.ts` (solo delegan).

## UI

- `packages/ui/src/property-consulta-form.tsx` → `POST /api/consultas` con `name`, `email`, `phone`, `message`; **`propertyId` solo en ficha** (número finito mayor que 0).
- Fichas: `propertyId={property.id}`. Páginas `/contacto`: sin `propertyId` → `contacts`.

## MCP vs web

El **MCP** de KiteProp es para herramientas tipo Cursor / integraciones; el visitante del sitio **no** usa MCP. La web usa rutas propias + REST como arriba.

## Esquema del JSON de propiedades

Campos del export `externalsite`, tipos de propiedad, `status`, tags Premier: **`docs/DATA_LAYER.md`** (solo capa de datos del array de propiedades).
