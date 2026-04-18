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
  return Boolean(resolveAvalonCatalogBffUrl() && resolveServerToServerBearerSecret());
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
  const res = await fetch(catalogUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${secret}`,
      'User-Agent': kitepropOutboundUserAgent(),
    },
    ...fetchInit,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Avalon catalog BFF HTTP ${res.status}: ${t.slice(0, 200)}`);
  }
  const json: unknown = await res.json();
  return parseKitepropPropertyFeedJsonPayload(json);
}
