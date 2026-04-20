import { loadKitepropCatalogMerged } from '@avalon/core';
import { cache } from 'react';

/**
 * Catálogo (una lectura por request en React cache): prioridad API KiteProp con key,
 * luego BFF si está configurado; sin datos vivos → [] (ver `loadKitepropCatalogMerged` en core).
 */
export const getCachedRawProperties = cache(loadKitepropCatalogMerged);
