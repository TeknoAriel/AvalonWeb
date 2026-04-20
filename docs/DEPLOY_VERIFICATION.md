# Deploy, verificación automática y “no veo el cambio”

## Una sola fuente de deploy (recomendado en este repo)

| Origen | Rol en este monorepo |
|--------|----------------------|
| **Vercel ↔ Git** (proyecto conectado al repo) | **Deploy automático** en cada push a la rama de producción. Es la vía principal. |
| **GitHub Actions** — `Deploy Vercel + ready (manual)` | **Solo `workflow_dispatch`**: `vercel deploy` desde CI para casos excepcionales (preview, recuperación). No corre en push. |
| **GitHub Actions** — `Verify production sites` | Tras **push a `main`**: espera ~50 s y ejecuta `post-deploy-verify.sh` contra las URLs de **producción** (secrets `PRODUCTION_URL_*`). No dispara deploy. |

Así no hay **dos instancias** (Git + CLI) compitiendo por el mismo proyecto en cada commit.

---

## Límites de deploy y cuotas (Vercel) — no confundir con bugs de código

Vercel aplica **topes por plan** (deployments por día, minutos de build, rate limits de API, etc.). Los números **cambian** con el tiempo; el mail que recibiste (ej. “25 al día”) puede ser **de otra época, otro producto o otra métrica**. Siempre conviene mirar la doc **oficial del plan actual**: [Hobby](https://vercel.com/docs/plans/hobby) · [Pro](https://vercel.com/docs/plans/pro-plan) · [Usage en el dashboard](https://vercel.com/dashboard).

**Referencia actual (revisá el enlace):** en la tabla del plan *Hobby* suele figurar del orden de **~100 deployments por día** y *Pro* miles; no tomes estos valores como eternos.

**Síntomas típicos cuando te frenó el plan / la API:**

- El CLI o la API responden **429**, “rate limit”, “too many requests”, mensajes de **quota** o de **deployment limit**.
- El workflow **Deploy Vercel + ready (manual)** falla en `vercel deploy` **sin** haber tocado código nuevo (solo si lo ejecutaste a mano).

**Qué hace este repo:** si el log del CLI parece tope de Vercel, `scripts/ci-diagnose-vercel-deploy-log.sh` emite un **`::notice`** para no confundirlo con bug de app.

**Mitigación:** deploy automático solo por **Vercel ↔ Git**; menos previews innecesarios; o subir de plan / esperar reset diario según Vercel.

---

## Verificación automática (Actions)

- **`CI`** (`.github/workflows/ci.yml`): en push/PR — lint, build, snapshot, ingesta opcional.
- **`Verify production sites`** (`.github/workflows/verify-production-sites.yml`): en **push a `main`** — breve espera + **`scripts/post-deploy-verify.sh`** contra `PRODUCTION_URL_AVALON_WEB` y `PRODUCTION_URL_AVALON_PREMIER` (mismos secrets que el smoke del cron). Comprueba `GET /`, `/propiedades` y, si hay **`CRON_SECRET`**, el BFF `/api/internal/catalog` con Bearer.

Si falta algún `PRODUCTION_URL_*`, el job **no falla** (aviso en log): definí los secrets para activar la verificación.

### Secrets / variables en GitHub (repo → Settings → Secrets and variables → Actions)

| Nombre | Uso |
|--------|-----|
| `PRODUCTION_URL_AVALON_WEB` | Origen `https://…` de Avalon Web (sin `/` final). **Verify production sites** |
| `PRODUCTION_URL_AVALON_PREMIER` | Origen Premier. **Verify production sites** + smoke cron |
| `CRON_SECRET` | Bearer al BFF en verify; mismo valor que Vercel |
| `VERCEL_TOKEN` + `VERCEL_ORG_ID` + `VERCEL_PROJECT_ID_*` | Solo si ejecutás **manual** `Deploy Vercel + ready` |

Variable opcional: **`POST_DEPLOY_MIN_CATALOG_ROWS`** (ej. `150`) — mínimo de filas en el JSON del BFF.

### Probar el script en local

```bash
export DEPLOY_URL_WEB='https://avalonweb.vercel.app'
export DEPLOY_URL_PREMIER='https://avalon-premier.vercel.app'
export POST_DEPLOY_CRON_SECRET='mismo_que_vercel'
# opcional: export POST_DEPLOY_MIN_CATALOG_ROWS=50
pnpm post-deploy:verify
```

---

## Listado Premier “no muestra las +20 propiedades”

El listado usa **`loadKitepropCatalogMerged`**: API KiteProp primero (si hay key en Premier), luego BFF → Web **`/api/internal/catalog`**. Las páginas usan **`force-dynamic`** en `/propiedades`.

Revisá en orden:

1. **Vercel Web:** `KITEPROP_API_KEY` válida; sin ella el BFF responde **503** o `[]` (ya no hay fallback a `properties.json`).
2. **Vercel Premier:** `KITEPROP_API_KEY` (recomendado, misma que Web) y/o `AVALON_CATALOG_INTERNAL_URL` + `CRON_SECRET` correctos.
3. **Reglas Premier** (`isPremierSiteListable`, tags, status): muchas filas en el feed pueden no ser “listables” en Premier; compará con `pnpm kp:ingest-stats` / `pnpm check:premier-snapshot` en local con la misma key.
4. **Dominio que abrís:** confirmá en Vercel → *Deployments* cuál deployment está **Current** en producción y abrí la *Preview URL* de ese mismo commit para descartar caché de otro deployment.

---

## Otros workflows

- **`CI`** (`ci.yml`): lint, build, snapshot, ingesta opcional con `KITEPROP_API_KEY` en secrets del repo.
- **`Verify production sites`** (`verify-production-sites.yml`): HTTP + BFF tras push a `main` (URLs `PRODUCTION_URL_*`).
- **`Verify production cron`** (`verify-production-cron.yml`): smoke `GET /api/cron/refresh-catalog` (schedule / manual).
