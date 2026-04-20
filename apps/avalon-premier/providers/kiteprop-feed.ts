/**
 * Feed: `loadKitepropCatalogMerged` (API KiteProp primero, BFF después; sin fallback a JSON empaquetado).
 * Listado = `getSitePropertiesFromRaw` → `isPremierSiteListable`.
 */
import { getSitePropertiesFromRaw } from '@avalon/core';
import type { NormalizedProperty, SiteType } from '@avalon/types';
import { getCachedRawProperties } from '@/lib/raw-properties';

export async function getPropertiesFromKitepropFeed(site: SiteType): Promise<NormalizedProperty[]> {
  const raw = await getCachedRawProperties();
  return getSitePropertiesFromRaw(site, raw);
}
