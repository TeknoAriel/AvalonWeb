# Deploy, verificación automática y “no veo el cambio”

## Dos formas de deploy (no mezclar sin criterio)

| Origen | Qué hace |
|--------|-----------|
| **Vercel ↔ Git** (Import en dashboard) | Cada push a la rama de producción construye y asigna el deployment al dominio canónico (`avalonweb.vercel.app`, dominio propio, etc.). |
| **GitHub Actions** — workflow `Deploy Vercel + ready` | Ejecuta `vercel deploy` con el token del repo (`VERCEL_TOKEN` + `VERCEL_PROJECT_ID_*`). **Mismo proyecto** que Git si los IDs coinciden. |

Si **ambos** están activos sobre el mismo proyecto, pueden generar **dos builds por commit**; el dominio público queda en el último que Vercel marque como *Current*. Si solo mirás el workflow de GitHub, la URL impresa es la del **deployment** (a veces `*.vercel.app` de preview); el dominio custom puede estar en **otro** deployment de la misma app.

**Recomendación:** o bien confiás solo en **Git → Vercel** y desactivás el workflow de deploy del repo, o bien mantenés Actions y en Vercel desactivás “Ignored Build Step” / desconectás el auto deploy duplicado para esa rama. Lo importante es **una sola fuente** que defina qué build es *Production*.

---

## Límites de deploy y cuotas (Vercel) — no confundir con bugs de código

Vercel aplica **topes por plan** (deployments por día, minutos de build, rate limits de API, etc.). Los números **cambian** con el tiempo; el mail que recibiste (ej. “25 al día”) puede ser **de otra época, otro producto o otra métrica**. Siempre conviene mirar la doc **oficial del plan actual**: [Hobby](https://vercel.com/docs/plans/hobby) · [Pro](https://vercel.com/docs/plans/pro-plan) · [Usage en el dashboard](https://vercel.com/dashboard).

**Referencia actual (revisá el enlace):** en la tabla del plan *Hobby* suele figurar del orden de **~100 deployments por día** y *Pro* miles; no tomes estos valores como eternos.

**Síntomas típicos cuando te frenó el plan / la API:**

- El CLI o la API responden **429**, “rate limit”, “too many requests”, mensajes de **quota** o de **deployment limit**.
- El workflow **Deploy Vercel + ready** falla en el paso `vercel deploy` **sin** haber tocado código nuevo.

**Qué hace este repo:** si el log del deploy parece un tope de Vercel, el script `scripts/ci-diagnose-vercel-deploy-log.sh` emite un **aviso** en GitHub Actions (`::notice`) para que no lo interpretes como fallo de la aplicación. Igual el job puede seguir en rojo hasta que Vercel acepte de nuevo el deploy.

**Mitigación:** menos pushes que disparen deploy doble (Git + Actions), previews solo cuando hagan falta, o subir de plan / esperar al reset diario del contador según indique Vercel.

---

## Verificación automática (Actions)

En cada push, el workflow **Deploy Vercel + ready** (`.github/workflows/deploy-vercel.yml`):

1. **Lint + build** de ambas apps.
2. **Deploy** `apps/avalon-propiedades` → luego `apps/avalon-premier`.
3. **`scripts/post-deploy-verify.sh`** sobre las **URLs devueltas por el CLI**:
   - `GET /` y `GET /propiedades` en Web y Premier → **200** (reintentos compartidos ~3–4 min).
   - Si existe el secret **`CRON_SECRET`** en GitHub (mismo valor que en Vercel Web): `GET …/api/internal/catalog` con **Bearer** → **200** y JSON array con al menos **`POST_DEPLOY_MIN_CATALOG_ROWS`** filas (variable del repo; default **1** en el script).

Si falla el paso 3, el workflow sale en **rojo**: revisá el log del job *Verificar (HTTP + BFF opcional)*.

### Secrets / variables en GitHub (repo → Settings → Secrets and variables → Actions)

| Nombre | Obligatorio para deploy CLI | Obligatorio para BFF en verify |
|--------|------------------------------|--------------------------------|
| `VERCEL_TOKEN` | Sí | — |
| `VERCEL_ORG_ID` | Sí (variable) | — |
| `VERCEL_PROJECT_ID_AVALONWEB` | Sí (variable) | — |
| `VERCEL_PROJECT_ID_PREMIER` | Sí (variable) | — |
| `CRON_SECRET` | No | Sí, si querés que falle el build si el catálogo BFF no responde o viene vacío |

Variable opcional: **`POST_DEPLOY_MIN_CATALOG_ROWS`** (ej. `150`) para exigir un mínimo de filas en el JSON del BFF (útil para detectar API caída o snapshot equivocado).

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

El listado **no** viene de un tercer servidor: Premier lee el catálogo vía **`AVALON_CATALOG_INTERNAL_URL`** → Avalon Web **`/api/internal/catalog`**. En la app, `getPropertiesFromKitepropFeed` usa **`force-dynamic`** en `/propiedades` (no es una página estática vieja por ISR).

Revisá en orden:

1. **Vercel Web:** `KITEPROP_API_KEY` definida y válida; sin ella el BFF devuelve poco o datos viejos según fallback.
2. **Vercel Premier:** `AVALON_CATALOG_INTERNAL_URL` = `https://<tu-dominio-web>/api/internal/catalog` (origen correcto, no una preview vieja si esperás datos de producción).
3. **Reglas Premier** (`isPremierSiteListable`, tags, status): muchas filas en el feed pueden no ser “listables” en Premier; compará con `pnpm kp:ingest-stats` / `pnpm check:premier-snapshot` en local con la misma key.
4. **Dominio que abrís:** confirmá en Vercel → *Deployments* cuál deployment está **Current** en producción y abrí la *Preview URL* de ese mismo commit para descartar caché de otro deployment.

---

## Otros workflows

- **`CI`** (`ci.yml`): lint, build, snapshot, ingesta opcional con `KITEPROP_API_KEY` en secrets del repo.
- **Verify production cron** (`verify-production-cron.yml`): smoke del cron en URLs fijas de producción (`PRODUCTION_URL_*`); no sustituye la verificación post-deploy por URL de CLI.
