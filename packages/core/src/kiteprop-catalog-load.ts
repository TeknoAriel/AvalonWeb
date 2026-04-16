import type { RawProperty } from '@avalon/types';
import { KITEPROP_PROPERTY_FEED_TAG } from './kiteprop-cache-tag';
import { fetchKitepropPropertyFeedAsRaw } from './kiteprop-api-feed';
import { parseKitepropPropertyFeedJsonPayload } from './kiteprop-feed-payload';
import { ALL_RAW_PROPERTIES } from './load';
import { mergePremierMetadataFromRepoSnapshot } from './premier-snapshot-merge';

const defaultFetchInit = {
  next: { revalidate: 21_600, tags: [KITEPROP_PROPERTY_FEED_TAG] },
} as RequestInit & { next: { revalidate: number; tags: string[] } };

function finalizeWithSnapshotMerge(rows: RawProperty[]): RawProperty[] {
  return mergePremierMetadataFromRepoSnapshot(rows, ALL_RAW_PROPERTIES);
}

/**
 * Descarga única del catálogo KiteProp (misma URL/API/snapshot para Avalon y Premier).
 * Cada app solo aplica `getSitePropertiesFromRaw(site, raw)` — Premier = `hasPremierTag`, Avalon = lo contrario.
 */
export async function loadKitepropCatalogMerged(): Promise<RawProperty[]> {
  const url = process.env.KITEPROP_PROPERTIES_JSON_URL?.trim();
  if (url) {
    try {
      const res = await fetch(url, defaultFetchInit);
      if (res.ok) {
        const data: unknown = await res.json();
        const fromJson = parseKitepropPropertyFeedJsonPayload(data);
        if (fromJson.length > 0) return finalizeWithSnapshotMerge(fromJson);
      }
    } catch {
      /* fallback API / snapshot */
    }
  }

  const fromApi = await fetchKitepropPropertyFeedAsRaw(defaultFetchInit);
  if (fromApi?.length) return finalizeWithSnapshotMerge(fromApi);

  return finalizeWithSnapshotMerge(ALL_RAW_PROPERTIES);
}
