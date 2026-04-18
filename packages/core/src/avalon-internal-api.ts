import type { RawProperty } from '@avalon/types';
import { parseKitepropPropertyFeedJsonPayload } from './kiteprop-feed-payload';
import { kitepropOutboundUserAgent } from './kiteprop-outbound';

/**
 * **Un solo secreto** para cron Vercel y para BFF interno (catálogo + consultas proxy):
 * `CRON_SECRET`. Si en algún entorno legacy seguís usando `INTERNAL_CATALOG_SECRET`, también vale.
 */
export function resolveServerToServerBearerSecret(): string {
  return (
    process.env.CRON_SECRET?.trim() ||
    process.env.INTERNAL_CATALOG_SECRET?.trim() ||
    ''
  );
}

/**
 * **Solo depuración.** Si vale `1`, el GET `/api/internal/catalog` no exige Bearer y Premier puede
 * consumir el BFF sin `CRON_SECRET`. **Quitar en producción** cuando el flujo esté verificado.
 */
export function isCatalogIngestDebug(): boolean {
  return process.env.CATALOG_INGEST_DEBUG === '1';
}

/**
 * URL absoluta del BFF de catálogo en Avalon Web (ej. `https://avalonweb.vercel.app/api/internal/catalog`).
 * **Solo** esta variable activa el modo cliente BFF (no se deriva de `NEXT_PUBLIC_AVALON_URL`), para que
 * Avalon Web nunca llame a su propio `/api/internal/catalog` por accidente cuando define el secreto.
 */
export function resolveAvalonCatalogBffUrl(): string | null {
  const explicit = process.env.AVALON_CATALOG_INTERNAL_URL?.trim();
  if (!explicit) return null;
  try {
    new URL(explicit);
    return explicit;
  } catch {
    return null;
  }
}

/** Origen de Avalon Web para `POST /api/internal/consultas` (derivado del BFF de catálogo o URL pública). */
export function resolveAvalonInternalApiOrigin(): string | null {
  const catalog = resolveAvalonCatalogBffUrl();
  if (catalog) {
    try {
      return new URL(catalog).origin;
    } catch {
      /* fall */
    }
  }
  const pub = process.env.NEXT_PUBLIC_AVALON_URL?.trim();
  if (!pub) return null;
  try {
    return new URL(pub.endsWith('/') ? pub : `${pub}/`).origin;
  } catch {
    return null;
  }
}

export function isAvalonCatalogBffConfigured(): boolean {
  const url = resolveAvalonCatalogBffUrl();
  if (!url) return false;
  if (isCatalogIngestDebug()) return true;
  return Boolean(resolveServerToServerBearerSecret());
}

export function isAvalonConsultaProxyConfigured(): boolean {
  return Boolean(resolveAvalonInternalApiOrigin() && resolveServerToServerBearerSecret());
}

/**
 * GET al BFF de catálogo (Avalon Web). La respuesta ya viene con merge de snapshot del lado origen.
 */
export async function fetchRawCatalogFromAvalonBff(
  catalogUrl: string,
  secret: string,
  fetchInit: RequestInit & { next?: { revalidate?: number; tags?: string[] } },
): Promise<RawProperty[]> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': kitepropOutboundUserAgent(),
  };
  if (!isCatalogIngestDebug() && secret) {
    headers.Authorization = `Bearer ${secret}`;
  }

  const res = await fetch(catalogUrl, {
    method: 'GET',
    headers,
    ...fetchInit,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Avalon catalog BFF HTTP ${res.status}: ${t.slice(0, 200)}`);
  }
  const json: unknown = await res.json();
  return parseKitepropPropertyFeedJsonPayload(json);
}
