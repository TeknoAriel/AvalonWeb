# KiteProp — referencia única (Avalon)

Documento canónico para **variables de entorno**, **lectura de catálogo** y **envío de consultas al CRM**. Evita duplicar reglas en otros archivos: si algo cambia, actualizá acá y enlazá desde README o brief.

## Enlaces oficiales

- [API v1 — documentación](https://www.kiteprop.com/docs/api/v1)
- Blog KiteProp: artículo sobre **vincular la web por API** y habilitación de API en el CRM (buscar en el sitio si la URL cambia).

## Seguridad

- La **API key** solo en **servidor** (Vercel / `.env.local`). Nunca en el cliente ni en `NEXT_PUBLIC_*`.
- El navegador llama a **`/api/consultas`** de la app; Next valida y llama a KiteProp con `X-API-Key`.

## Cron del catálogo vs “push” al cambiar una propiedad

| Enfoque | Ventaja | Límite |
|--------|---------|--------|
| **Cron** (`/api/cron/refresh-catalog` + `revalidateTag`) | No depende de que KiteProp implemente webhooks hacia tu dominio; mismo flujo en Vercel y fácil de auditar. | Hasta el intervalo del cron (p. ej. 2 h) + ISR antes de ver el cambio en HTML cacheado. |
| **Webhook / push** desde KiteProp | Actualización casi inmediata si el CRM llama a tu URL al guardar. | Hace falta **endpoint acordado con KiteProp** (URL pública, secreto, idempotencia) y mantenimiento; hoy este repo **no** recibe webhooks de KiteProp. |

**Recomendación:** mantener **cron + ISR** como base estable. Si KiteProp ofrece webhook oficial a tu stack, se puede añadir una ruta tipo `POST /api/revalidate` (o dedicada) que invalide `KITEPROP_PROPERTY_FEED_TAG` sin reemplazar el cron (el cron sigue cubriendo cambios que no disparen webhook).

### Cron en Vercel: variables y valores

| Nombre | Qué ponés |
|--------|-----------|
| **`CRON_SECRET`** | Un secreto largo solo servidor (ej. salida de `openssl rand -hex 32`). Lo definís en **Vercel → Project → Settings → Environment Variables** en cada proyecto que use el cron (`avalon-propiedades`, `avalon-premier`). Podés usar el **mismo** valor en ambos para simplificar. |

**Comportamiento:** Vercel Cron hace **`GET /api/cron/refresh-catalog`** a tu dominio. Si `CRON_SECRET` está definido en el proyecto, Vercel envía **`Authorization: Bearer <CRON_SECRET>`**; la ruta solo revalida si esa cabecera coincide con `process.env.CRON_SECRET`. Sin variable → respuesta **503** y no hay revalidación.

**Frecuencia:** en cada app, `vercel.json` declara el cron cada **2 horas** (`0 */2 * * *`).

**No hay otras variables específicas del cron:** para releer el catálogo siguen valiendo `KITEPROP_API_KEY`, `KITEPROP_API_BASE_URL`, etc.

**Prueba manual:**  
`curl -sS -H "Authorization: Bearer TU_CRON_SECRET" "https://<tu-dominio>/api/cron/refresh-catalog"`

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
| `KITEPROP_API_KEY` o `KITEPROP_API_TOKEN` | **Obligatorio para el catálogo en producción:** `X-API-Key` en `GET …/properties` (listado) y en POST de consultas. Sin key, el sitio usa solo el snapshot `properties.json` del repo. |
| `KITEPROP_API_BASE_URL` | Base del listado API; default `https://www.kiteprop.com/api/v1`. Opcionales: `KITEPROP_API_PROPERTIES_PATH`, `KITEPROP_API_STATUS_FILTER`, `KITEPROP_API_PER_PAGE`. |
| `KITEPROP_API_NO_ACTIVE_UNPUBLISHED` | Si vale `1`, el listado API **no** concatena `active_unpublished` cuando el filtro es solo `active` (por defecto **sí** se concatena, para alinear con fichas Premier listables como unpublished). |
| `KITEPROP_API_URL` | Host **sin** `/api/v1` para POST de consultas (ej. `https://www.kiteprop.com`). Si no está, se deduce de `KITEPROP_API_BASE_URL`. |
| `KITEPROP_API_CONSULTA_URL` | **Opcional.** Si está definida, **todas** las consultas van a esa URL con cuerpo **legacy** (`full_name`, `body`, `property_id`, etc.). Solo para tenants con endpoint distinto acordado con soporte. |
| `CRON_SECRET` | Secreto del **cron** de revalidación (`GET /api/cron/refresh-catalog`). Ver tabla arriba en **Cron en Vercel**. |

Copiá valores concretos desde `.env.example` (comentado) en cada app o en Vercel.

### Producción (Vercel) — checklist catálogo Premier

- **Deploy desde GitHub** (si la integración Git→Vercel no dispara builds): workflow **`.github/workflows/deploy-vercel.yml`**. Un solo secret **`VERCEL_TOKEN`** ([crear token](https://vercel.com/account/tokens)). El workflow hace `vercel link` + **`vercel deploy --prod`** (el **build corre en Vercel**, no en el runner de Actions). Los slugs de proyecto y el team están en el YAML (`matrix` + `VERCEL_TEAM`); si falla el link del sitio principal, ajustá el `project` del matrix al slug exacto (URL `vercel.com/<team>/<slug>`).
- Declarar **`KITEPROP_API_KEY`** (o `KITEPROP_API_TOKEN`) en **los dos** proyectos Vercel del monorepo: slug **`avalon-premier`** y slug **`avalonweb`** (carpetas `apps/avalon-premier` y `apps/avalon-propiedades`). Cada deploy tiene su propio env; si falta en Premier, el sitio cae al snapshot del repo, con muchos menos ítems Premier que la API.
- El segmento Premier lee el flag **`premier` / `is_premier`** (y alias) en la fila API o anidado en **`attributes`**, **`meta`**, etc. Si el CRM solo marca Premier ahí, debe llegar en el JSON de `GET …/properties`.
- **`CRON_SECRET`** en ambos si usás el cron de revalidación.
- Si ves **403 / 1010** desde el servidor hacia KiteProp, probá **`KITEPROP_FETCH_USER_AGENT`** con un UA de navegador reciente; el core ya envía uno por defecto en `fetch` del catálogo y en consultas.

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
