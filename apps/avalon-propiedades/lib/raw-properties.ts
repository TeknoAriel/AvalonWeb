import { loadKitepropCatalogMerged } from '@avalon/core';
import { cache } from 'react';

/** Misma descarga que Premier; Avalon filtra excluyendo inventario Premier en `getSitePropertiesFromRaw`. */
export const getCachedRawProperties = cache(loadKitepropCatalogMerged);
