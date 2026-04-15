/**
 * Feed de propiedades: JSON remoto opcional (`KITEPROP_PROPERTIES_JSON_URL`) o snapshot en core.
 * Premier solo muestra activos con tag / flag Premier (`hasPremierTag` en @avalon/core).
 */
import { getSitePropertiesFromRaw } from '@avalon/core';
import type { NormalizedProperty, SiteType } from '@avalon/types';
import { getCachedRawProperties } from '@/lib/raw-properties';

export async function getPropertiesFromKitepropFeed(site: SiteType): Promise<NormalizedProperty[]> {
  const raw = await getCachedRawProperties();
  return getSitePropertiesFromRaw(site, raw);
}
