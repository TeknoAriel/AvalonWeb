# Operación en producción (una sola línea de trabajo)

**Modelo:** un solo ingest a KiteProp en **Avalon Web**. **Avalon Premier** solo pide el catálogo por HTTP a Avalon Web y filtra Premier en código. **Un solo secreto servidor** compartido: `CRON_SECRET` (protege el cron de Vercel **y** el Bearer de `/api/internal/*`). Si ya tenías `INTERNAL_CATALOG_SECRET`, seguí usándolo; si no, **no hace falta crear otro**: usá solo `CRON_SECRET` en ambos proyectos.

---

## 0. Verificación por pasos (recomendado)

### Paso A — KiteProp (solo tu máquina o CI con key)

Con la misma `KITEPROP_API_KEY` que en Vercel:

```bash
export KITEPROP_API_KEY='kp_…'
pnpm kp:ingest-stats
```

Salida JSON: `totalRows` y `premierTagCount`. Si `premierTagCount` es 0 pero en el CRM hay Premier, el problema está en **mapeo/tags** (no en Premier ni en el BFF). Si aquí ya ves el número esperado, KiteProp → Avalon está bien.

### Paso B — BFF sin Bearer (solo mientras depurás; **apagar después**)

En **Avalon Web** y **Premier** (Vercel → Production): `CATALOG_INGEST_DEBUG=1`

- En Avalon Web, `GET /api/internal/catalog` **no** pide `Authorization`.
- Premier puede usar el BFF **sin** `CRON_SECRET` para el catálogo.

**Riesgo:** cualquiera con la URL puede leer el listado. Poné `CATALOG_INGEST_DEBUG=0` o borrá la variable en cuanto veas el flujo OK, y volvé a `CRON_SECRET` + Bearer.

### Paso C — Ruta del BFF

La URL correcta es **`/api/internal/catalog`** (no `/api/catalog`). Ejemplo: `https://avalonweb.vercel.app/api/internal/catalog`.

---

## 1. Proyecto Vercel **Avalon Web** (`apps/avalon-propiedades`)

| Variable | Obligatorio |
|----------|-------------|
| `KITEPROP_API_KEY` | Sí |
| `CRON_SECRET` | Sí (cron + BFF interno) |
| `NEXT_PUBLIC_SITE_URL` | Sí (URL canónica de este sitio) |
| `NEXT_PUBLIC_WHATSAPP` | Recomendado |

No definas `AVALON_CATALOG_INTERNAL_URL` aquí.

---

## 2. Proyecto Vercel **Avalon Premier** (`apps/avalon-premier`)

| Variable | Obligatorio |
|----------|-------------|
| `CRON_SECRET` | Sí (**mismo valor** que en Avalon Web) |
| `AVALON_CATALOG_INTERNAL_URL` | Sí → `https://<dominio-avalon-web>/api/internal/catalog` |
| `NEXT_PUBLIC_SITE_URL` | Sí (URL canónica Premier) |
| `NEXT_PUBLIC_AVALON_URL` | Sí (URL base de Avalon Web, sin `/api/...`) |
| `NEXT_PUBLIC_WHATSAPP` | Recomendado |

`KITEPROP_API_KEY` en Premier: **no hace falta** si el BFF y el proxy de consultas responden.

---

## 3. Después de guardar variables

Redeploy **Production** en **ambos** proyectos (mismo commit del repo).

---

## 4. Probar el BFF desde tu máquina

```bash
cd /ruta/al/AvalonWeb
export CRON_SECRET='mismo_valor_que_vercel'
export AVALON_CATALOG_INTERNAL_URL='https://TU_DOMINIO_AVALON/api/internal/catalog'   # si no es avalonweb.vercel.app
pnpm bff:verify-catalog
```

Debe imprimir `HTTP 200`.

---

## 5. Detalle técnico (opcional)

`docs/KITEPROP.md` — API KiteProp, consultas, troubleshooting.

---

## 6. Verificación infalible en CI (cada commit en `main` / PR)

### Qué corre en GitHub Actions (`.github/workflows/ci.yml`)

| Paso | Qué garantiza |
|------|----------------|
| **Lint** | Código consistente. |
| **Build** (`pnpm build`) | **Avalon Web y Avalon Premier** compilan (monorepo Turbo = ambas apps). |
| **`pnpm check:premier-snapshot`** | El snapshot empaquetado sigue teniendo al menos un listable Premier (red de seguridad del repo). |
| **`pnpm ci:verify-ingest`** | Si definís el secret **`KITEPROP_API_KEY`** (o `KITEPROP_API_TOKEN`) en el repo → descarga el feed real y falla si `totalRows` &lt; `MIN_INGEST_TOTAL_ROWS` (variable de repo **Vars** `MIN_INGEST_TOTAL_ROWS`, default 1). Opcional: **`MIN_PREMIER_TAG_COUNT`** (ej. `28`) para exigir mínimo de filas con `hasPremierTag`. |
| **Artefacto** `kiteprop-ingest-report` | JSON del último reporte (solo si se generó `ingest-report.json`). |

Sin `KITEPROP_API_KEY` en Secrets, la ingesta live **no falla** el CI (aviso en log); para que sea “infalible” en el sentido estricto, **agregá el secret** en GitHub → *Settings → Secrets and variables → Actions*.

### Cron en producción (diario + manual)

Workflow **`.github/workflows/verify-production-cron.yml`**:

- **Secrets:** `CRON_SECRET`, `PRODUCTION_URL_AVALON_WEB`, `PRODUCTION_URL_AVALON_PREMIER` (origen `https://…` sin `/` final).
- Hace `GET …/api/cron/refresh-catalog` con el mismo `Authorization: Bearer` que Vercel Cron; comprueba **HTTP 200** y `"ok":true`.

**Qué no garantiza:** que KiteProp haya respondido bien en ese instante (solo que tu app aceptó el cron y revalidó). La ingesta real la cubre el paso **`ci:verify-ingest`** con la API key.

### Tras cada deploy

1. Esperá a que **CI** en el commit pase (verde).  
2. En *Actions* → **Verify production cron** → *Run workflow* (opcional pero recomendado).
