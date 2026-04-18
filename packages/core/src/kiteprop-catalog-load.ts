import type { RawProperty } from '@avalon/types';
import {
  fetchRawCatalogFromAvalonBff,
  isAvalonCatalogBffConfigured,
  resolveAvalonCatalogBffUrl,
  resolveServerToServerBearerSecret,
} from './avalon-internal-api';
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
 * Solo KiteProp (API + key) o snapshot empaquetado. **Sin** BFF de Avalon.
 * Usar en el servidor Avalon Web que expone `/api/internal/catalog` y en tests.
 */
export async function loadKitepropCatalogFromKitepropApi(): Promise<RawProperty[]> {
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

/**
 * Catálogo en servidor.
 *
 * **Modo BFF (p. ej. Avalon Premier):** si hay `AVALON_CATALOG_INTERNAL_URL` y **`CRON_SECRET`**
 * (mismo valor que protege el cron; opcional legacy `INTERNAL_CATALOG_SECRET`), se hace `GET` a Avalon Web
 * (`/api/internal/catalog`) y se usa esa respuesta (ya mergeada en origen). Sin key KiteProp en Premier.
 *
 * **Modo directo (p. ej. Avalon Web):** `GET …/properties` con `KITEPROP_API_KEY` o snapshot si no hay key.
 *
 * Cada app sigue aplicando `getSitePropertiesFromRaw(site, raw)` sobre el mismo cuerpo de datos.
 */
export async function loadKitepropCatalogMerged(): Promise<RawProperty[]> {
  if (isAvalonCatalogBffConfigured()) {
    const url = resolveAvalonCatalogBffUrl();
    const secret = resolveServerToServerBearerSecret();
    if (!url || !secret) {
      return loadKitepropCatalogFromKitepropApi();
    }
    try {
      const fromBff = await fetchRawCatalogFromAvalonBff(url, secret, defaultFetchInit);
      if (fromBff.length > 0) {
        return fromBff;
      }
    } catch {
      /* snapshot */
    }
    return finalizeWithSnapshotMerge(ALL_RAW_PROPERTIES);
  }

  return loadKitepropCatalogFromKitepropApi();
}
