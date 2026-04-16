import { loadKitepropCatalogMerged } from '@avalon/core';
import { cache } from 'react';

/** Catálogo KiteProp (una sola descarga; Premier filtra con `hasPremierTag` en `getSitePropertiesFromRaw`). */
export const getCachedRawProperties = cache(loadKitepropCatalogMerged);
