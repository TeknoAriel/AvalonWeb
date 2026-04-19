/**
 * Feed de propiedades: API KiteProp (con key) o snapshot en core (`loadKitepropCatalogMerged`).
 * Premier lista lo que cumple `isPremierSiteListable` (segmento + estado — ver `@avalon/core`).
 */
import { getSitePropertiesFromRaw } from '@avalon/core';
import type { NormalizedProperty, SiteType } from '@avalon/types';
import { getCachedRawProperties } from '@/lib/raw-properties';

export async function getPropertiesFromKitepropFeed(site: SiteType): Promise<NormalizedProperty[]> {
  const raw = await getCachedRawProperties();
  return getSitePropertiesFromRaw(site, raw);
}
