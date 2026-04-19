# KiteProp — referencia única (Avalon)

**Operación día a día (pocas variables, un solo flujo):** [`docs/OPERACION.md`](./OPERACION.md).

Este archivo es la referencia **técnica** (API, cron, troubleshooting). Evita duplicar reglas en otros archivos: si algo cambia, actualizá acá y enlazá desde README o brief.

## Enlaces oficiales

- [API v1 — documentación](https://www.kiteprop.com/docs/api/v1)
- Blog KiteProp: artículo sobre **vincular la web por API** y habilitación de API en el CRM (buscar en el sitio si la URL cambia).

## Seguridad

- La **API key** solo en **servidor** (Vercel / `.env.local`). Nunca en el cliente ni en `NEXT_PUBLIC_*`.
- El navegador llama a **`/api/consultas`** de la app; Next valida y llama a KiteProp con `X-API-Key`.

### Paso 1 — Clave API en Vercel (sin duplicar)

**Nombre canónico (el que debe quedar):** `KITEPROP_API_KEY`.

1. Abrí **Vercel → proyecto (`avalon-premier` o `avalonweb`) → Settings → Environment Variables** (entorno **Production** y, si usás, **Preview**).
2. **Si ves dos filas:** `KITEPROP_API_KEY` **y** `KITEPROP_API_TOKEN` (aunque tengan el mismo valor):
   - **Borrá la fila `KITEPROP_API_TOKEN`.**
   - **No borres `KITEPROP_API_KEY`.** Debe seguir con tu clave `kp_…`.
3. **Si solo existe `KITEPROP_API_TOKEN` y no existe `KITEPROP_API_KEY`:**
   - **Agregá** una variable **`KITEPROP_API_KEY`** con el **mismo** valor que tenía `KITEPROP_API_TOKEN`.
   - **Borrá la fila `KITEPROP_API_TOKEN`.**
4. Guardá y hacé **Redeploy** de ese proyecto para que no quede caché de build con la config vieja.

El código aún acepta `KITEPROP_API_TOKEN` como respaldo en runtime, pero **en Vercel no hace falta definirla**: una sola regla (`KITEPROP_API_KEY`) evita confusiones.

### Catálogo: modo recomendado (BFF en Avalon Web)

**Un solo ingest contra KiteProp** lo hace **avalonweb** (`apps/avalon-propiedades`). Expone:

| Ruta | Uso |
|------|-----|
| **`GET /api/internal/catalog`** | Mismo JSON que `loadKitepropCatalogFromKitepropApi()`. Auth: **`Authorization: Bearer <CRON_SECRET>`** (mismo que el cron). Legacy: si no hay `CRON_SECRET`, se acepta `INTERNAL_CATALOG_SECRET`. |
| **`POST /api/internal/consultas`** | Reenvío a KiteProp. Misma auth + `X-Web-Consulta-Source: avalon-premier`. |

**Variables:** tabla mínima en **[`docs/OPERACION.md`](./OPERACION.md)**. Resumen: **no hace falta** `INTERNAL_CATALOG_SECRET` si ya definís **`CRON_SECRET`** en ambos proyectos con el **mismo** valor.

**Crons:** mantener el cron en **ambos** proyectos (`/api/cron/refresh-catalog`).

**Probar el BFF:** `export CRON_SECRET='…'` (y opcional `AVALON_CATALOG_INTERNAL_URL`) → `pnpm bff:verify-catalog` → `HTTP 200`.

### Modo clásico (sin BFF)

Si **no** definís `AVALON_CATALOG_INTERNAL_URL` en Premier, `loadKitepropCatalogMerged` vuelve a leer KiteProp desde esa app (necesitás `KITEPROP_API_KEY` ahí). Útil en local sin levantar las dos apps.

### Vercel — variables que el código **no** usa (borralas en avalonweb y avalon-premier)

El runtime del catálogo **no** lee usuario/contraseña para `GET …/properties`: la API v1 documentada usa **`X-API-Key`** (ver **Autenticación REST** más abajo). Si tenés filas como `KITEPROP_API_USER` / `KITEPROP_API_PASSWORD`, generan ruido y confusión; **borralas** en **ambos** proyectos.

| Variable a borrar | Motivo |
|-------------------|--------|
| **`KITEPROP_PROPERTIES_JSON_URL`** | El catálogo **no** consume JSON de difusión por URL; solo API + snapshot. |
| **`KITEPROP_API_USER`** | No existe en el código de este monorepo (no afecta al ingest). |
| **`KITEPROP_API_PASSWORD`** | No existe en el código de este monorepo. |

**Ingest estable con solo URL + key (recomendado en avalonweb):**

| Variable | Valor típico |
|----------|----------------|
| **`KITEPROP_API_KEY`** | `kp_…` (Production). |
| **`KITEPROP_API_BASE_URL`** o **`KITEPROP_API_URL`** | `https://www.kiteprop.com/api/v1` (el feed usa **BASE** si está; si no, **API_URL**). No hace falta duplicar las dos con distinto valor. |

El cliente del feed (`packages/core/src/kiteprop-api-feed.ts`) envía **`X-API-Key: <KITEPROP_API_KEY>`** (y `User-Agent`). Los scripts `pnpm kp:ingest-stats`, `pnpm kp:premier-feed-report` y `pnpm catalog:regenerate-snapshot` usan el mismo camino.

### Ingest local (misma cabecera que producción)

En la terminal, **una variable por línea** (sin pegar comentarios `#` en la misma línea que el `export` si tu zsh no tiene `interactivecomments`):

```bash
export KITEPROP_API_KEY='kp_TU_CLAVE_REAL'
export KITEPROP_API_URL='https://www.kiteprop.com/api/v1'
pnpm kp:ingest-stats
```

El JSON incluye `kitepropApiBaseResolved` y `premierListableCount`. Ese último es el número de filas que el **sitio Premier** mostraría **si** el `raw` del servidor fuera idéntico al de esta descarga.

### Checklist: que Premier muestre las mismas **N** que `premierListableCount`

1. **`pnpm kp:ingest-stats`** en local con la misma key que **Production** en **avalonweb** → anotá `premierListableCount` (ej. 24) y `totalRows`.
2. **avalonweb (Vercel → Production):** `KITEPROP_API_KEY` + `KITEPROP_API_URL` o `KITEPROP_API_BASE_URL`; **Redeploy** tras cambiar env.
3. **avalon-premier (Production):** `AVALON_CATALOG_INTERNAL_URL` = `https://<tu-dominio-avalonweb>/api/internal/catalog` (sin barra final extra rara) y **`CRON_SECRET` idéntico** al de avalonweb (Bearer del BFF). **Redeploy** Premier.
4. **Probar BFF** (desde tu máquina): `curl -sS -H "Authorization: Bearer <CRON_SECRET>" "https://<avalonweb>/api/internal/catalog"` → debe ser **200** y un JSON array; su **longitud** debe ser del orden de `totalRows` del ingest (p. ej. ~229). Premier luego **filtra en código** a las **N** listables Premier (las 24): si el array del BFF es muy corto o vacío, el sitio no podrá mostrar 24 aunque el CRM las tenga.
5. Si el BFF responde bien pero el sitio muestra pocas: revisá que no estés viendo **Preview** con env viejo, o un **dominio** distinto al del deploy *Current*.

### Proyecto **avalon-premier** — URLs públicas sin duplicar

En `getSiteBrandConfig('premier')` la URL “de este sitio” es **`NEXT_PUBLIC_SITE_URL`** (con fallback a `NEXT_PUBLIC_PREMIER_URL`). El enlace al otro sitio usa **`NEXT_PUBLIC_PEER_SITE_URL`** si está definida; si no, **`NEXT_PUBLIC_AVALON_URL`** (o el default de producción).

Si **`NEXT_PUBLIC_SITE_URL`** ya es la URL canónica de Premier (p. ej. `https://avalon-premier.vercel.app`), **podés borrar `NEXT_PUBLIC_PREMIER_URL`** en este proyecto: queda redundante.

Si **`NEXT_PUBLIC_PEER_SITE_URL`** y **`NEXT_PUBLIC_AVALON_URL`** apuntan al **mismo** sitio (avalonweb), **borrá `NEXT_PUBLIC_PEER_SITE_URL`** y dejá solo **`NEXT_PUBLIC_AVALON_URL`** (queda una sola regla para “el sitio hermano”).

**Lista mínima recomendada (avalon-premier, Production, con BFF):** `INTERNAL_CATALOG_SECRET`, `AVALON_CATALOG_INTERNAL_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_AVALON_URL`, `NEXT_PUBLIC_WHATSAPP`, **`CRON_SECRET`** si usás cron. Opcional: `KITEPROP_API_KEY` como respaldo si el BFF no responde (consultas y catálogo).

## Cron del catálogo vs “push” al cambiar una propiedad

| Enfoque | Ventaja | Límite |
|--------|---------|--------|
| **Cron** (`/api/cron/refresh-catalog` + `revalidateTag`) | No depende de que KiteProp implemente webhooks hacia tu dominio; mismo flujo en Vercel y fácil de auditar. | Hasta el intervalo del cron (p. ej. 2 h) + ISR antes de ver el cambio en HTML cacheado. |
| **Webhook / push** desde KiteProp | Actualización casi inmediata si el CRM llama a tu URL al guardar. | Hace falta **endpoint acordado con KiteProp** (URL pública, secreto, idempotencia) y mantenimiento; hoy este repo **no** recibe webhooks de KiteProp. |

**Recomendación:** mantener **cron + ISR** como base estable. Si KiteProp ofrece webhook oficial a tu stack, se puede añadir una ruta tipo `POST /api/revalidate` (o dedicada) que invalide `KITEPROP_PROPERTY_FEED_TAG` sin reemplazar el cron (el cron sigue cubriendo cambios que no disparen webhook).

### Cron en Vercel: variables y valores

| Nombre | Qué ponés |
|--------|-----------|
| **`CRON_SECRET`** | Un secreto largo solo servidor (ej. salida de `openssl rand -hex 32`). Lo definís en **Vercel → Project → Settings → Environment Variables** en cada proyecto que use el cron (**`avalonweb`** y **`avalon-premier`**). Podés usar el **mismo** valor en ambos para simplificar. |

**Comportamiento:** Vercel Cron hace **`GET /api/cron/refresh-catalog`** a tu dominio. Si `CRON_SECRET` está definido en el proyecto, Vercel envía **`Authorization: Bearer <CRON_SECRET>`**; la ruta solo revalida si esa cabecera coincide con `process.env.CRON_SECRET`. Sin variable → respuesta **503** y no hay revalidación.

**Frecuencia:** revisá `apps/*/vercel.json` en el repo (hoy suele ser **1× día** en UTC, p. ej. `30 9 * * *`); no confundir con comentarios viejos de “cada 2 h” salvo que lo hayas cambiado en tu fork.

**No hay otras variables específicas del cron:** en avalonweb el catálogo vivo sigue dependiendo de `KITEPROP_API_KEY` (y opcionales de feed). En Premier con BFF, del cron depende la revalidación del fetch hacia avalonweb.

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
| **`KITEPROP_API_KEY`** (canónica en Vercel) | **Obligatorio para el catálogo en producción:** `X-API-Key` en `GET …/properties` (listado) y en POST de consultas. Sin key, el sitio usa solo el snapshot `properties.json` del repo. |
| `KITEPROP_API_TOKEN` | **Solo respaldo en código** (mismo uso que la key). **No la definidas en Vercel** si ya tenés `KITEPROP_API_KEY`; ver **Paso 1** arriba. |
| `KITEPROP_API_BASE_URL` | Base del listado `GET …/properties`; default `https://www.kiteprop.com/api/v1`. Opcionales: `KITEPROP_API_PROPERTIES_PATH`, `KITEPROP_API_STATUS_FILTER`, `KITEPROP_API_PER_PAGE`. |
| `KITEPROP_API_URL` | Si **no** definiste `KITEPROP_API_BASE_URL`, el **feed del catálogo** usa este valor como base (misma URL con `/api/v1` está bien). Para **POST de consultas**, el core también usa `KITEPROP_API_URL` como host raíz (ver `kiteprop-consulta.ts`). |
| `KITEPROP_API_NO_ACTIVE_UNPUBLISHED` | Si vale `1`, el listado API **no** concatena `active_unpublished` cuando el filtro es solo `active` (por defecto **sí** se concatena, para alinear con fichas Premier listables como unpublished). |
| **`KITEPROP_PREMIER_SAVED_LIST_IDS`** | Opcional. IDs de **lista guardada / propsheet** en KiteProp (ej. URL [`…/propsheet/saved/348/0138`](https://www.kiteprop.com/propsheet/saved/348/0138) → `0138`). Varios: coma. Si el JSON de `GET …/properties` incluye ese id en campos típicos (`lists`, `groups`, `saved_list_ids`, anidados en `attributes` / `meta`), el core cuenta la fila como segmento Premier aunque no venga la palabra en `tags`. Si `pnpm kp:ingest-stats` muestra `premierSavedListRowCount: 0` con el id configurado, **la API no está mandando** ese vínculo: conviene confirmar con KiteProp el campo exacto o usar `PREMIER_PROPERTY_IDS` temporalmente. |
| `KITEPROP_PREMIER_PROPSHEET_ID` | Alias de un solo id (mismo uso que una entrada en `KITEPROP_PREMIER_SAVED_LIST_IDS`). |
| `KITEPROP_API_CONSULTA_URL` | **Opcional.** Si está definida, **todas** las consultas van a esa URL con cuerpo **legacy** (`full_name`, `body`, `property_id`, etc.). Solo para tenants con endpoint distinto acordado con soporte. |
| `CRON_SECRET` | Secreto del **cron** de revalidación (`GET /api/cron/refresh-catalog`). Ver tabla arriba en **Cron en Vercel**. |

Copiá valores concretos desde `.env.example` (comentado) en cada app o en Vercel.

### Producción (Vercel) — checklist catálogo Premier

- **Deploy:** por defecto **Vercel ↔ Git** en cada push (ambos proyectos). El workflow **`.github/workflows/deploy-vercel.yml`** quedó **solo manual** (`workflow_dispatch`) para no duplicar deploys con el CLI. Opcional: **`.github/workflows/verify-production-sites.yml`** valida `/`, `/propiedades` y el BFF en producción tras push a `main` (secrets `PRODUCTION_URL_*` + `CRON_SECRET`).
- **Vercel + Turbo — error `.../apps/avalon-premier/apps/avalon-premier`:** en el proyecto Vercel, **Root Directory** = `apps/avalon-premier` y **Output Directory** vacío o **`.next`** (nunca otra vez la ruta `apps/...`). Si no, Next queda en `.../apps/avalon-premier/.next` pero Vercel busca una carpeta mal compuesta. El `turbo.json` del repo declara `globalPassThroughEnv` para que **`KITEPROP_API_KEY`** (y otras) lleguen al `turbo build` en Vercel (sin eso Turbo las oculta y el build puede advertir o el runtime quedar sin API).
- **Premier “en cero” con API:** confirmá **`KITEPROP_API_KEY`** en **Production** del proyecto **avalon-premier** (no solo Preview). Con la misma key, el script `scripts/verify_kiteprop_api_premier.py` cuenta filas con señal Premier. Si KiteProp manda el modificador en **`modificadores` / `modifiers`** u otro nombre, el core los trata como alias de etiquetas; si usan otro campo, hay que añadirlo a `KITEPROP_TAG_FIELD_ALIASES` en `kiteprop-api-mapper.ts`. Mientras tanto podés listar IDs en **`PREMIER_PROPERTY_IDS`** (coma) para forzar el listado Premier.
- Declarar **`KITEPROP_API_KEY`** en **los dos** proyectos Vercel del monorepo: slug **`avalon-premier`** y slug **`avalonweb`** (carpetas `apps/avalon-premier` y `apps/avalon-propiedades`). Cada deploy tiene su propio env; si falta en Premier, el sitio cae al snapshot del repo, con muchos menos ítems Premier que la API.
- El segmento Premier lee el flag **`premier` / `is_premier`** (y alias) en la fila API o anidado en **`attributes`**, **`meta`**, etc. Si el CRM solo marca Premier ahí, debe llegar en el JSON de `GET …/properties`.
- **`CRON_SECRET`** en ambos si usás el cron de revalidación.
- Si ves **403 / 1010** desde el servidor hacia KiteProp, probá **`KITEPROP_FETCH_USER_AGENT`** con un UA de navegador reciente; el core ya envía uno por defecto en `fetch` del catálogo y en consultas.

## Informe Premier (cada fila del feed + descartes del sitio)

Con la misma `KITEPROP_API_KEY` que en Vercel:

```bash
export KITEPROP_API_KEY='kp_…'
pnpm kp:premier-feed-report
```

Imprime un **JSON resumen** (`totalRows`, `hasPremierTagCount`, `isPremierSiteListableCount`, histogramas) y lista en líneas las filas **descartadas del listado Premier** con `discard` + `detalle` en español.

- **`PREMIER_FEED_REPORT_FULL=1`**: imprime el array JSON de **todas** las filas (mismo shape que `diagnosePremierFeedRow` en `@avalon/core`).
- **`PREMIER_FEED_REPORT_JSON=/ruta/archivo.json`**: escribe resumen + filas en disco.

Reglas: `hasPremierTag` = segmento Premier; `isPremierSiteListable` = entra al sitio Premier (segmento y **no** estado terminal tipo `sold` / `archived` / … — ver `listing-rules.ts`).

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
