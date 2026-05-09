# Estado actual: redirecciones KiteProp, Premier, consultas y operación

**Última actualización:** Mayo 2026.

Este documento sirve como **punto único de referencia** para quien opera el negocio (lenguaje claro) y para quien mantiene el código (detalle técnico y ejemplos).

Documentos relacionados:

- Deploy y checks: [`docs/DEPLOY_VERIFICATION.md`](./DEPLOY_VERIFICATION.md)
- Operación día a día y secretos: [`docs/OPERACION.md`](./OPERACION.md)
- KiteProp API / ingest / variables: [`docs/KITEPROP.md`](./KITEPROP.md)
- Inventario Premier (reglas de segmento): [`docs/PREMIER_INVENTORY_INVARIANT.md`](./PREMIER_INVENTORY_INVARIANT.md)

---

## Parte A — Resumen ejecutivo (lenguaje no técnico)

### ¿Qué hace la web cuando alguien entra desde KiteProp?

- Si la propiedad es de la **colección Premier**, el visitante termina en **Avalon Premier** (dominio de marca, no el `*.vercel.app` por defecto).
- Si no es Premier, se queda en el sitio **Avalon Web** (propiedades generales).
- Los parámetros de la URL que vienen de campañas (por ejemplo `?fw_uid=2`) **se conservan** en la redirección.

### ¿Qué se validó en operación?

- Redirecciones desde URLs cortas y desde fichas en Avalon hacia Premier cuando corresponde.
- Dominio final de Premier alineado a **`https://www.avalonpremier.com.ar`** cuando la configuración anterior apuntaba solo a Vercel.
- Formularios de consulta: pruebas con respuesta **correcta** desde ambos sitios (`ok: true`).
- Las dos aplicaciones publican la **misma versión** de código (se puede comprobar con `/api/version`).

### ¿Cada cuánto se actualiza el catálogo automáticamente?

En Vercel, **una vez al día** a las **09:30** (cron en formato estándar `30 9 * * *`; Vercel lo interpreta en **UTC**). Detalle en la sección técnica **Cron**.

---

## Parte B — Referencia técnica

### B.1 Mapa de archivos relevantes

| Área | Ubicación |
|------|-----------|
| Entrada KiteProp `/kp/{id}` | `apps/avalon-propiedades/app/kp/[id]/route.ts` |
| Entrada legacy `/propiedades/kp/{segment}` | `apps/avalon-propiedades/app/propiedades/kp/[segment]/route.ts` |
| Lógica compartida redirect + URL Premier | `apps/avalon-propiedades/lib/kiteprop-entry-redirect.ts` |
| Ficha Avalon (redirect Premier, SEO, JSON-LD) | `apps/avalon-propiedades/app/propiedades/[slug]/page.tsx` |
| Ficha Premier (slug canónico, SEO, JSON-LD) | `apps/avalon-premier/app/propiedades/[slug]/page.tsx` |
| SEO compartido (helpers) | `packages/core/src/property-listing-seo.ts` |
| URLs base / peer site fallback | `packages/config/src/index.ts` |
| API consultas Web | `apps/avalon-propiedades/app/api/consultas/route.ts` |
| API consultas Premier (proxy opcional + KiteProp) | `apps/avalon-premier/app/api/consultas/route.ts` |
| Validación y envío a KiteProp | `packages/core/src/consultas-submission.ts`, `packages/core/src/kiteprop-consulta.ts` |
| Cron catálogo (definición Vercel) | `apps/avalon-propiedades/vercel.json`, `apps/avalon-premier/vercel.json` |

### B.2 Rutas de entrada KiteProp (`avalon-propiedades`)

- **`GET /kp/[id]`** — ID numérico o segmento parsable como ID.
- **`GET /propiedades/kp/[segment]`** — Misma lógica; admite también slugs tipo `508481-propiedad`.

Flujo:

1. Parseo de ID (`parseKitepropEntryId`).
2. Carga catálogo: `loadKitepropCatalogMerged()`.
3. Si **listable Premier** (`isPremierSiteListable`): redirect a base Premier + `/propiedades/{buildPropertySlug}`.
4. Si no: redirect a Avalon + misma ruta de ficha.
5. Redirect **301** + cabecera **`Link: <URL>; rel="canonical"`**.
6. Query string copiada al destino (`?fw_uid=…`, etc.).

### B.3 Dominio de redirección a Premier

Orden efectivo para armar la base del sitio Premier en redirects servidor:

1. **`PREMIER_SITE_URL`** o **`PREMIER_REDIRECT_URL`** (solo servidor / Vercel) si están definidas.
2. **`NEXT_PUBLIC_PEER_SITE_URL`** (u otras env de marca) solo si dan URL **HTTPS absoluta** que **no** sea `*.vercel.app`.
3. Si el peer configurado cae en **`*.vercel.app`**, se usa **`https://www.avalonpremier.com.ar`** para que la URL final sea de marca.

Recomendación en Vercel (proyecto Web): fijar `NEXT_PUBLIC_PEER_SITE_URL=https://www.avalonpremier.com.ar` y/o `PREMIER_SITE_URL` igual para enlaces cliente y servidor alineados.

### B.4 Fichas `/propiedades/[slug]`

**Avalon (`avalon-propiedades`):**

- Si existe `RawProperty` y es **Premier listable**, **`redirect`** al dominio Premier con la misma query.
- Para el resto: ficha solo si **`isPubliclyListedForSite(avalon)`** y **no** `isPremierInventory` (misma semántica que antes, con menos búsquedas repetidas en catálogo).
- Helpers: **`metadataFromSeo`** para no duplicar bloques OG/Twitter/canonical.

**Premier (`avalon-premier`):**

- Si el slug URL no coincide con **`buildPropertySlug(raw)`**, **redirect** interno al slug canónico (preserva query).
- Solo muestra ficha si **`isPremierSiteListable`**.
- Mismo patrón de metadata centralizada.

**SEO / datos estructurados:**

- Canonical, Open Graph y Twitter coherentes por ficha.
- JSON-LD `RealEstateListing` (`buildRealEstateListingJsonLd`).

### B.5 Optimización aplicada en fichas (performance / mantenimiento)

Sin cambiar reglas de negocio:

- Una sola resolución de **`rawRow`** por request donde antes se combinaba `raw.find` + `getPropertyByIdFromRaw` con trabajo duplicado.
- Normalización **`normalizeProperty(rawRow)`** cuando ya se validó listabilidad, en lugar de re-buscar por ID.
- Metadatos en helper reutilizable → menos código duplicado y menos riesgo de divergencia OG vs canonical.

### B.6 Cron del catálogo

Definido en ambos proyectos Next:

```json
{ "path": "/api/cron/refresh-catalog", "schedule": "30 9 * * *" }
```

- Una ejecución **diaria** a las **09:30**.
- Interpretación habitual en Vercel: **UTC** (confirmar hora efectiva AR en el dashboard de Cron).

### B.7 Consultas (`POST /api/consultas`)

Validación servidor: **`submitWebConsulta`** / **`submitWebConsultaWithOptionalAvalonProxy`** (`packages/core/src/consultas-submission.ts`). Campos típicos: `name`, `email`, `message` (5–2000 chars), opcionales `phone`, `property_id`, `site`, `page_url`, etc.

Ejemplo contra **Premier** (solo prueba; reemplazar email/mensaje):

```bash
curl -sS -X POST "https://www.avalonpremier.com.ar/api/consultas" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Prueba Soporte",
    "email":"prueba+e2e@example.com",
    "message":"Consulta automática de prueba — validar llegada a KiteProp.",
    "property_id":508481,
    "site":"avalon-premier",
    "page_url":"https://www.avalonpremier.com.ar/propiedades/508481-propiedad"
  }'
```

Ejemplo contra **Web**:

```bash
curl -sS -X POST "https://www.avaloninmobiliaria.com/api/consultas" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Prueba Soporte 2",
    "email":"prueba2+e2e@example.com",
    "message":"Segunda prueba — validar flujo Web → KiteProp.",
    "property_id":508481,
    "site":"avalon-propiedades",
    "page_url":"https://www.avaloninmobiliaria.com/kp/508481"
  }'
```

Respuesta esperada en éxito: `{"ok":true}` con HTTP **200**.

### B.8 Verificación de versión desplegada

```bash
curl -sS "https://www.avaloninmobiliaria.com/api/version"
curl -sS "https://www.avalonpremier.com.ar/api/version"
```

Devuelve `sha` (commit Git en Vercel), `branch` y `timestamp`.

---

## Parte C — Ejemplos de comportamiento (URLs)

| Entrada (ejemplo) | Resultado esperado |
|-------------------|--------------------|
| `https://www.avaloninmobiliaria.com/kp/508481?fw_uid=2` | 301 → `https://www.avalonpremier.com.ar/propiedades/508481-propiedad?fw_uid=2` (si Premier listable; dominio público, no `.vercel.app`) |
| `https://www.avaloninmobiliaria.com/propiedades/kp/508481?fw_uid=2` | Misma decisión segmento/query |
| `https://www.avaloninmobiliaria.com/propiedades/508481-propiedad?fw_uid=2` | Redirect a Premier con query si está en colección Premier |
| Slug Premier distinto del canónico | En sitio Premier, redirect interno al slug `buildPropertySlug` |

---

## Parte D — Checklist de prueba rápida

1. Abrir `/kp/<id-premier>?fw_uid=2` desde Web y ver **Location** → `avalonpremier.com.ar`.
2. Abrir `/propiedades/<slug-premier>?fw_uid=2` desde Web mismo resultado.
3. `/api/version` en ambos dominios con **mismo `sha`** tras un deploy.
4. `POST /api/consultas` en ambos dominios → `{"ok":true}`.
5. Tras el cron del día, validar que el listado refleja cambios del feed (smoke en `/propiedades`).

---

## Parte E — Estado

**Operativo y documentado.**  
Comportamiento acordado: segmentación Premier, URLs de marca, consultas, cron diario, y pulido de rendimiento en fichas sin alterar reglas de listado.
