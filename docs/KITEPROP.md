# KiteProp — referencia única (Avalon)

Documento canónico para **variables de entorno**, **lectura de catálogo** y **envío de consultas al CRM**. Evita duplicar reglas en otros archivos: si algo cambia, actualizá acá y enlazá desde README o brief.

## Enlaces oficiales

- [API v1 — documentación](https://www.kiteprop.com/docs/api/v1)
- Blog KiteProp: artículo sobre **vincular la web por API** y habilitación de API en el CRM (buscar en el sitio si la URL cambia).

## Seguridad

- La **API key** solo en **servidor** (Vercel / `.env.local`). Nunca en el cliente ni en `NEXT_PUBLIC_*`.
- El navegador llama a **`/api/consultas`** de la app; Next valida y llama a KiteProp con `X-API-Key`.

## Autenticación REST (API v1 oficial)

Resumen tomado del **apidoc publicado** por KiteProp (misma fuente que alimenta [API v1 — documentación](https://www.kiteprop.com/docs/api/v1); JSON: `https://www.kiteprop.com/docs/api/v1/api_data.json`, bloque *API Key Auth* / `ApiKeyAuth`):

- **Modo recomendado para integraciones (sitios web, terceros):** clave permanente **API Key** generada en el panel (**API Keys**), asociada a un usuario de la organización; los permisos de cada request son los de ese usuario.
- **Cómo enviarla:** incluir la cabecera HTTP **`X-API-Key`**. La documentación indica explícitamente que **no** hace falta login ni **Bearer token** para este flujo.
- **Formato de la clave:** permanente, prefijo típico **`kp_`** (ejemplo en la doc oficial).
- **Login email + contraseña** (`POST /api/v1/auth/login`): figura como **DEPRECATED**; la doc dirige a usar API Key vía **`X-API-Key`** para integraciones permanentes.

No aparece en esa especificación un mecanismo paralelo tipo “enviar la misma secret como `client` en el cuerpo” para sustituir a **`X-API-Key`** en REST: el contrato documentado del recurso *ApiKeyAuth* es **cabecera `X-API-Key`**.

**MCP remoto** (`https://mcp.kiteprop.com/mcp`, config en Cursor): según la guía de KiteProp para clientes MCP, la misma idea es **cabecera `X-API-Key`** en la configuración del servidor MCP; es **otro transporte** (MCP sobre HTTP), no otro nombre de cabecera en la API REST v1.

## Variables de entorno (resumen)

| Variable | Uso |
|----------|-----|
| `KITEPROP_PROPERTIES_JSON_URL` | JSON de difusión (prioridad sobre API y snapshot). Misma URL en ambas apps si comparten export. |
| `KITEPROP_API_KEY` o `KITEPROP_API_TOKEN` | `X-API-Key` en REST (listado `GET …/properties` y POST de consultas). **Si hay JSON URL + esta key**, el servidor **siempre** pide también el listado API y fusiona tags Premier por `id` sobre el JSON (ver `loadKitepropCatalogMerged`). |
| `KITEPROP_API_BASE_URL` | Base del listado API; default `https://www.kiteprop.com/api/v1`. Opcionales: `KITEPROP_API_PROPERTIES_PATH`, `KITEPROP_API_STATUS_FILTER`, `KITEPROP_API_PER_PAGE`. |
| `KITEPROP_API_URL` | Host **sin** `/api/v1` para POST de consultas (ej. `https://www.kiteprop.com`). Si no está, se deduce de `KITEPROP_API_BASE_URL`. |
| `KITEPROP_API_CONSULTA_URL` | **Opcional.** Si está definida, **todas** las consultas van a esa URL con cuerpo **legacy** (`full_name`, `body`, `property_id`, etc.). Solo para tenants con endpoint distinto acordado con soporte. |

Copiá valores concretos desde `.env.example` (comentado) en cada app o en Vercel.

## Verificación API desde terminal (Premier / tags)

Para comprobar si **`GET …/properties`** devuelve marcadores Premier (sin pegar la key en el chat ni en el repo):

1. En tu máquina, cargá la misma clave que en Vercel (solo en el shell o en `.env.local` gitignored). Tiene que ser **`export`**: si escribís solo `KP_KEY=…` en la línea, `pnpm` / `python` hijos **no** ven la variable.
   - `export KP_KEY='kp_…'` **o** `export KITEPROP_API_KEY='kp_…'`
   - Opcional: `export KITEPROP_API_BASE_URL=https://www.kiteprop.com/api/v1` (default del core)
   - Opcional: `export KITEPROP_API_STATUS_FILTER=active` (igual que el fetch del catálogo por defecto)
2. Desde la raíz del monorepo, **en dos líneas** (no pongas comentarios `# …` en la misma línea que `export` en zsh, puede fallar):
   - `export KP_KEY='kp_…'`
   - `pnpm kp:verify-premier` **o** `python3 scripts/verify_kiteprop_api_premier.py`

El script pagina como el cliente del core, cuenta filas por `status` **en ese filtro**, lista **IDs** donde detecta señal tipo Premier (`tags` / `property_tags` / flags / strings con la palabra *premier*) y muestra una muestra de `tags` de las primeras filas.

**Cloudflare 403 / error 1010 (`browser_signature_banned`):** el User-Agent por defecto de `Python-urllib` a veces está bloqueado. El script ya envía un User-Agent genérico; si sigue fallando, probá `export KITEPROP_VERIFY_USER_AGENT='Mozilla/5.0 …'` (un UA de navegador reciente) y volvé a ejecutar, o usá `curl` con `-H "User-Agent: …"` contra el mismo URL.

**Nota:** con `status=active` solo ves el subconjunto “activos” que devuelve la API; para otros estados hay que cambiar `KITEPROP_API_STATUS_FILTER` y volver a correr (si tu tenant lo permite). La documentación interactiva: [API v1](https://www.kiteprop.com/docs/api/v1).

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

El **MCP** de KiteProp es para herramientas tipo Cursor / integraciones; el visitante del sitio **no** usa MCP. La web usa rutas propias + REST con **`X-API-Key`** (arriba). La autenticación MCP remota usa la misma cabecera en la config del cliente; ver **Autenticación REST (API v1 oficial)**.

## Esquema del JSON de propiedades

Campos del export `externalsite`, tipos de propiedad, `status`, tags Premier: **`docs/DATA_LAYER.md`** (solo capa de datos del array de propiedades).
