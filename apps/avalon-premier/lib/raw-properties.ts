import { loadKitepropCatalogMerged } from '@avalon/core';
import { cache } from 'react';

/**
 * Catálogo (una sola lectura por request en React cache): BFF Avalon Web si hay
 * `AVALON_CATALOG_INTERNAL_URL` + `INTERNAL_CATALOG_SECRET`, si no API KiteProp o snapshot.
 * Premier filtra con `hasPremierTag` en `getSitePropertiesFromRaw`.
 */
export const getCachedRawProperties = cache(loadKitepropCatalogMerged);
