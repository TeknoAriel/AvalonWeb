import type { RawProperty } from '@avalon/types';
import {
  fetchRawCatalogFromAvalonBff,
  isAvalonCatalogBffConfigured,
  isCatalogIngestDebug,
  resolveAvalonCatalogBffUrl,
  resolveServerToServerBearerSecret,
} from './avalon-internal-api';
import { kitepropApiFeedConfigured, fetchKitepropPropertyFeedAsRaw } from './kiteprop-api-feed';
import { KITEPROP_PROPERTY_FEED_TAG } from './kiteprop-cache-tag';

/** ISR alineado con cron de catálogo en producción (2 h) — solo lectura directa KiteProp. */
const CATALOG_REVALIDATE_SECONDS = 7_200;

const defaultFetchInit = {
  next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [KITEPROP_PROPERTY_FEED_TAG] },
} as RequestInit & { next: { revalidate: number; tags: string[] } };

/**
 * GET al BFF de Avalon: **sin** Data Cache larga en el consumidor (p. ej. Premier).
 * Si usamos el mismo `revalidate` que KiteProp, el listado Premier puede quedar días con un JSON viejo
 * mientras `pnpm kp:ingest-stats` (no-store) muestra el feed real → discrepancia tipo “24 vs 4”.
 */
const bffCatalogFetchInit = {
  cache: 'no-store' as const,
  /** 0 = sin ISR en el fetch al BFF (alineado con feed vivo); `tags` sigue permitiendo `revalidateTag` en rutas. */
  next: { revalidate: 0, tags: [KITEPROP_PROPERTY_FEED_TAG] },
} as RequestInit & { next: { revalidate: number; tags: string[] } };

/**
 * Una lectura **real** a KiteProp (si hay key). Si la API falla o devuelve 0 filas → `null`.
 * **Sin** merge con `properties.json`: el listado refleja solo lo que viene del feed (alineado con ingest).
 */
async function loadLiveKitepropCatalogOrNull(): Promise<RawProperty[] | null> {
  if (!kitepropApiFeedConfigured()) return null;
  try {
    const fromApi = await fetchKitepropPropertyFeedAsRaw(defaultFetchInit);
    if (fromApi && fromApi.length > 0) {
      return fromApi;
    }
  } catch (e) {
    console.warn(
      '[loadLiveKitepropCatalogOrNull] KiteProp API:',
      e instanceof Error ? e.message : e,
    );
  }
  return null;
}

/**
 * Solo KiteProp (API + key). Sin key o si la API falla → `[]` (**no** hay fallback a JSON empaquetado).
 * Usar en el servidor Avalon Web que expone `/api/internal/catalog` y en tests.
 */
export async function loadKitepropCatalogFromKitepropApi(): Promise<RawProperty[]> {
  const live = await loadLiveKitepropCatalogOrNull();
  return live ?? [];
}

/**
 * Catálogo en servidor — **solo datos vivos** (misma fuente que `pnpm kp:ingest-stats` cuando la API responde):
 *
 * 1. **API KiteProp** si hay `KITEPROP_API_KEY` (y URL).
 * 2. **BFF** `AVALON_CATALOG_INTERNAL_URL` + `CRON_SECRET` si no hay key o la API no devolvió filas.
 * 3. Si nada aplica → `[]` (no se sirve `properties.json` en runtime para no mostrar inventario viejo).
 */
export async function loadKitepropCatalogMerged(): Promise<RawProperty[]> {
  const live = await loadLiveKitepropCatalogOrNull();
  if (live && live.length > 0) {
    return live;
  }

  if (isAvalonCatalogBffConfigured()) {
    const url = resolveAvalonCatalogBffUrl();
    const secret = resolveServerToServerBearerSecret();
    if (url && (isCatalogIngestDebug() || secret)) {
      try {
        const fromBff = await fetchRawCatalogFromAvalonBff(url, secret, bffCatalogFetchInit);
        if (fromBff.length > 0) {
          return fromBff;
        }
        console.warn(
          '[loadKitepropCatalogMerged] BFF devolvió 0 filas.',
          { bffHost: safeUrlHost(url) },
        );
      } catch (e) {
        console.error(
          '[loadKitepropCatalogMerged] Falló el GET al BFF de catálogo:',
          e instanceof Error ? e.message : e,
          { bffHost: safeUrlHost(url) },
        );
      }
    }
  }

  return loadKitepropCatalogFromKitepropApi();
}

function safeUrlHost(u: string): string {
  try {
    return new URL(u).host;
  } catch {
    return '(url inválida)';
  }
}
