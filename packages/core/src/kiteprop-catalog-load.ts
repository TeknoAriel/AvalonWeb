import type { RawProperty } from '@avalon/types';
import { kitepropApiFeedConfigured, fetchKitepropPropertyFeedAsRaw } from './kiteprop-api-feed';
import { KITEPROP_PROPERTY_FEED_TAG } from './kiteprop-cache-tag';
import { ALL_RAW_PROPERTIES } from './load';
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
 * Catálogo KiteProp en servidor: **solo API** (con key) o snapshot del repo.
 * No se usa `KITEPROP_PROPERTIES_JSON_URL` ni ningún JSON de difusión en runtime.
 *
 * Orden fijo:
 * 1. Si hay `KITEPROP_API_KEY` / `KITEPROP_API_TOKEN` → `GET /api/v1/properties` (paginado). Si hay filas → catálogo.
 * 2. Si no hay key, o la API falla, o devuelve vacío → `packages/core/data/properties.json` (merge Premier con snapshot).
 *
 * Cada app aplica `getSitePropertiesFromRaw(site, raw)` — Premier = `hasPremierTag`, Avalon = lo contrario.
 */
export async function loadKitepropCatalogMerged(): Promise<RawProperty[]> {
  if (kitepropApiFeedConfigured()) {
    try {
      const fromApi = await fetchKitepropPropertyFeedAsRaw(defaultFetchInit);
      if (fromApi && fromApi.length > 0) {
        return finalizeWithSnapshotMerge(fromApi);
      }
    } catch {
      /* snapshot */
    }
  }

  return finalizeWithSnapshotMerge(ALL_RAW_PROPERTIES);
}
