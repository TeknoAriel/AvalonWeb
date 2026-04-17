import type { RawProperty } from '@avalon/types';
import { kitepropApiFeedConfigured, fetchKitepropPropertyFeedAsRaw } from './kiteprop-api-feed';
import { KITEPROP_PROPERTY_FEED_TAG } from './kiteprop-cache-tag';
import { parseKitepropPropertyFeedJsonPayload } from './kiteprop-feed-payload';
import { ALL_RAW_PROPERTIES } from './load';
import { applyPremierMetadataFromDonor } from './premier-metadata-donor';
import { mergePremierMetadataFromRepoSnapshot } from './premier-snapshot-merge';

/** ISR alineado con cron de catálogo en producción (2 h). */
const CATALOG_REVALIDATE_SECONDS = 7_200;

const defaultFetchInit = {
  next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [KITEPROP_PROPERTY_FEED_TAG] },
} as RequestInit & { next: { revalidate: number; tags: string[] } };

function finalizeWithSnapshotMerge(rows: RawProperty[]): RawProperty[] {
  return mergePremierMetadataFromRepoSnapshot(rows, ALL_RAW_PROPERTIES);
}

/**
 * Fusiona tags/flags Premier desde GET /properties sobre filas del JSON (misma `id`).
 * @param preloadedApiResult `undefined` = aún no se llamó a la API en esta request; `[]` o `null` = ya se intentó y no hay filas (no repetir fetch).
 */
async function supplementWithApiPremierTagsIfConfigured(
  rows: RawProperty[],
  preloadedApiResult: RawProperty[] | null | undefined,
): Promise<RawProperty[]> {
  if (rows.length === 0 || !kitepropApiFeedConfigured()) return rows;
  let apiRows: RawProperty[] | null = null;
  if (preloadedApiResult !== undefined && preloadedApiResult !== null && preloadedApiResult.length > 0) {
    apiRows = preloadedApiResult;
  } else if (preloadedApiResult === undefined) {
    apiRows = await fetchKitepropPropertyFeedAsRaw(defaultFetchInit);
  }
  if (!apiRows?.length) return rows;
  const byId = new Map(apiRows.map((r) => [r.id, r]));
  return rows.map((r) => {
    const donor = byId.get(r.id);
    if (!donor) return r;
    return applyPremierMetadataFromDonor(r, donor);
  });
}

/**
 * Descarga única del catálogo KiteProp (misma URL/API/snapshot para Avalon y Premier).
 *
 * **Orden fijo (irrompible):**
 * 1. Si hay **API key** → primero `GET /properties` (paginado). Si devuelve filas → **ese es el catálogo**
 *    (misma verdad que el CRM; un solo fetch; tags Premier incluidos).
 * 2. Si la API no está configurada o devolvió vacío/error → `KITEPROP_PROPERTIES_JSON_URL` si aplica.
 * 3. Si hay JSON + API key pero el paso 1 falló → se fusiona API sobre JSON por `id` **solo si** no se reutilizó
 *    un resultado API vacío (evita doble fetch inútil).
 * 4. Siempre `mergePremierMetadataFromRepoSnapshot` con `properties.json` del repo.
 * 5. Si nada sirve → solo snapshot.
 *
 * Cada app aplica `getSitePropertiesFromRaw(site, raw)` — Premier = `hasPremierTag`, Avalon = lo contrario.
 */
export async function loadKitepropCatalogMerged(): Promise<RawProperty[]> {
  let apiAttempt: RawProperty[] | null | undefined = undefined;
  if (kitepropApiFeedConfigured()) {
    try {
      const fromApi = await fetchKitepropPropertyFeedAsRaw(defaultFetchInit);
      apiAttempt = fromApi ?? null;
    } catch {
      apiAttempt = null;
    }
    if (apiAttempt && apiAttempt.length > 0) {
      return finalizeWithSnapshotMerge(apiAttempt);
    }
  }

  const url = process.env.KITEPROP_PROPERTIES_JSON_URL?.trim();
  if (url) {
    try {
      const res = await fetch(url, defaultFetchInit);
      if (res.ok) {
        const data: unknown = await res.json();
        const fromJson = parseKitepropPropertyFeedJsonPayload(data);
        if (fromJson.length > 0) {
          const preloaded =
            apiAttempt === undefined ? undefined : apiAttempt !== null && apiAttempt.length > 0 ? apiAttempt : [];
          const withApiPremier = await supplementWithApiPremierTagsIfConfigured(fromJson, preloaded);
          return finalizeWithSnapshotMerge(withApiPremier);
        }
      }
    } catch {
      /* snapshot */
    }
  }

  return finalizeWithSnapshotMerge(ALL_RAW_PROPERTIES);
}
