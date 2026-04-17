# Invariante operativo — inventario Avalon Premier (condición crítica)

Este documento define **reglas no negociables** para el listado Premier. Cualquier cambio en feed, mapper, filtros o apps **no debe violarlas** sin decisión explícita de producto.

## 1. Regla de negocio: qué entra en Premier

- Una propiedad aparece en **Avalon Premier** si y solo si, en servidor, **`hasPremierTag(raw)`** es verdadero para el `RawProperty` correspondiente **antes** de normalizar el lote del sitio (`getSitePropertiesFromRaw('premier', …)` en `packages/core/src/site-properties.ts`).
- Típicamente el CRM/export/API marca el segmento con el tag literal **`premier`** (en `tags`, como string CSV, en objetos con `name`/`slug`, flags `premier` / `is_premier`, u overrides por env — detalle exhaustivo en `docs/DATA_LAYER.md` sección *Tags Premier*).
- Las propiedades **sin** ese criterio **no** se listan en Premier; siguen en el flujo de **Avalon Propiedades** (exclusión mutua en el mismo raw).

**No existe** motor de búsqueda tipo Elasticsearch para este criterio: es **filtrado determinista en Node** sobre el array de propiedades cargado.

## 2. Orden de carga del feed (servidor)

Orden fijo (ver `apps/avalon-premier/lib/raw-properties.ts` y `docs/DATA_LAYER.md`):

1. `KITEPROP_PROPERTIES_JSON_URL` — JSON plano (export / externalsite).
2. Si no aplica o falla: API KiteProp v1 (`KITEPROP_API_KEY` / `KITEPROP_API_TOKEN`, etc.).
3. Si falla: snapshot `packages/core/data/properties.json` del repo.

Premier y Propiedades pueden compartir la misma URL de JSON en Vercel; Premier **solo** filtra el subconjunto con tag Premier.

## 3. API vs JSON — riesgo que rompió listados (lección aprendida)

- En el **export JSON**, suele venir `tags: ["premier"]` de forma directa.
- La **API v1** a veces devuelve **`tags: []`** o **`tags: ""`** mientras el dato útil está en **`property_tags`**, `kp_tags`, `tag_list`, etc.
- Un **ingest / difusión nueva** puede dejar de mandar **cualquier** etiqueta Premier (ni en `tags` ni en alias). En ese caso **`hasPremierTag` sobre el remoto solo** da falso.
- Mitigación en código: **`mergePremierMetadataFromRepoSnapshot`** (tras cargar JSON/API) recompone por **`id`** con `packages/core/data/properties.json` del repo: copia `tags` / `labels` / `categories` / flags y **claves auxiliares** (`property_tags`, `difusion_tags`, …) que el snapshot ya tenía curadas. Si el remoto trae otras etiquetas sin Premier, un segundo paso copia desde el snapshot hasta recuperar la señal.
- Mitigación operativa: **`PREMIER_PROPERTY_IDS`** / **`NEXT_PUBLIC_PREMIER_PROPERTY_IDS`** (coma) para forzar IDs Premier cuando el export no trae nada y el snapshot aún no incluye ese `id`.
- Usar **`p.tags ?? p.property_tags`** es **incorrecto**: `??` **no** sustituye arrays vacíos ni strings vacíos, así que se pierde el tag y **`hasPremierTag` da falso** → colección Premier vacía aunque el CRM esté bien.

**Obligatorio** en el mapper API (`packages/core/src/kiteprop-api-mapper.ts`): usar **`pickFirstNonEmpty`** (o equivalente) para `tags`, `labels` y `categories`, recorriendo alias en orden hasta encontrar el **primer valor con contenido**.

No reintroducir `??` encadenado simple sobre estos campos sin pasar por esa lógica.

## 4. Otros filtros que afectan el listado Premier

- **`isPubliclyListed`**: por defecto solo `status === 'active'` (`packages/core/src/listing-rules.ts`).
- **`passesPremierListingQualityGate`** (`packages/core/src/premier-curation.ts`): filtros opcionales por env (`PREMIER_MIN_GALLERY_IMAGES`, m² mínimos, IDs excluidos). No deben activarse en producción sin acuerdo; el default de fotos mínimas es **0** salvo env explícito.
- **Query string** (`filterNormalizedProperties`): filtros de URL pueden dejar el listado en 0 aunque haya inventario Premier.

## 5. Búsqueda en lenguaje natural (NL)

`NaturalSearchBar` + `/api/ai/parse-search` solo traducen texto a **parámetros de URL** y navegan al listado. **No** sustituyen ni reimplementan la regla del tag Premier.

## 6. Referencias de código

| Concepto | Ubicación |
|----------|-----------|
| Detección tag Premier | `packages/core/src/premier.ts` — `hasPremierTag`, `isPremierInventory` |
| Partición por sitio | `packages/core/src/site-properties.ts` — `getSitePropertiesFromRaw` |
| Mapper API → Raw | `packages/core/src/kiteprop-api-mapper.ts` — `pickFirstNonEmpty`, `mapKitepropApiV1PropertyToRaw` |
| Carga cacheada Premier | `apps/avalon-premier/providers/kiteprop-feed.ts` |
| Listado página | `apps/avalon-premier/app/propiedades/page.tsx` |

## 7. Cambios futuros — checklist

Antes de mergear cambios en feed/mapper/filtros/Premier:

- [ ] ¿Sigue cumpliéndose que solo `hasPremierTag` define el inventario Premier?
- [ ] Si se toca el mapper API, ¿se preserva `pickFirstNonEmpty` (o equivalente) para tags/labels/categories?
- [ ] ¿Se probó con JSON **y** con respuesta API donde `tags` viene vacío?
- [ ] ¿Documentación (`DATA_LAYER.md`, este archivo) sigue alineada?

---

*Última actualización: alineado con commits que fijaron `pickFirstNonEmpty` y la regla explícita en DATA_LAYER.*
