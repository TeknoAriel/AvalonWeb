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
 * Si hay `KITEPROP_API_KEY`, fusiona por `id` las etiquetas/flags Premier desde GET /properties
 * sobre filas que ya vinieron del JSON de difusión (el JSON suele omitir tags; la API no).
 */
async function supplementWithApiPremierTagsIfConfigured(rows: RawProperty[]): Promise<RawProperty[]> {
  if (rows.length === 0 || !kitepropApiFeedConfigured()) return rows;
  const apiRows = await fetchKitepropPropertyFeedAsRaw(defaultFetchInit);
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
 * 1. Si hay `KITEPROP_PROPERTIES_JSON_URL` y responde → parse JSON.
 * 2. Si además hay API key → **siempre** se pide GET `/properties` y se fusiona metadata Premier por `id`
 *    sobre el lote del JSON (corrige difusiones sin tag Premier).
 * 3. Luego `mergePremierMetadataFromRepoSnapshot` con `properties.json` del repo (red de seguridad).
 * 4. Si no hay JSON o falla → API completa; si falla → solo snapshot.
 *
 * Cada app aplica `getSitePropertiesFromRaw(site, raw)` — Premier = `hasPremierTag`, Avalon = lo contrario.
 */
export async function loadKitepropCatalogMerged(): Promise<RawProperty[]> {
  const url = process.env.KITEPROP_PROPERTIES_JSON_URL?.trim();
  if (url) {
    try {
      const res = await fetch(url, defaultFetchInit);
      if (res.ok) {
        const data: unknown = await res.json();
        const fromJson = parseKitepropPropertyFeedJsonPayload(data);
        if (fromJson.length > 0) {
          const withApiPremier = await supplementWithApiPremierTagsIfConfigured(fromJson);
          return finalizeWithSnapshotMerge(withApiPremier);
        }
      }
    } catch {
      /* fallback API / snapshot */
    }
  }

  const fromApi = await fetchKitepropPropertyFeedAsRaw(defaultFetchInit);
  if (fromApi?.length) return finalizeWithSnapshotMerge(fromApi);

  return finalizeWithSnapshotMerge(ALL_RAW_PROPERTIES);
}
