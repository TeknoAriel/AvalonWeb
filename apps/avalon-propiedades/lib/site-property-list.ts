import { getSitePropertiesFromRaw, sortByFeaturedThenRecent } from '@avalon/core';
import { getCachedRawProperties } from '@/lib/raw-properties';
import { SITE } from './site';

export async function loadSortedSiteProperties() {
  const raw = await getCachedRawProperties();
  return sortByFeaturedThenRecent(getSitePropertiesFromRaw(SITE, raw));
}
