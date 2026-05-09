import {
  buildPropertySlug,
  isPremierSiteListable,
  loadKitepropCatalogMerged,
  parsePropertySlugParam,
} from '@avalon/core';
import { getSiteBrandConfig } from '@avalon/config';
import type { RawProperty } from '@avalon/types';
import { NextResponse, type NextRequest } from 'next/server';

function baseNoSlash(u: string): string {
  return u.replace(/\/$/, '');
}

/** Si `peerSite` viene vacío o sin esquema, `redirect()` interpreta ruta relativa y no cambia de dominio. */
const FALLBACK_PREMIER_ORIGIN = 'https://www.avalonpremier.com.ar';

function isAbsoluteHttpUrl(s: string): boolean {
  return s.startsWith('http://') || s.startsWith('https://');
}

/**
 * Destino Premier para redirects:
 * - `PREMIER_SITE_URL` / `PREMIER_REDIRECT_URL` (servidor) tienen prioridad si están definidos.
 * - Si `NEXT_PUBLIC_PEER_SITE_URL` quedó en `*.vercel.app`, la Location debe ser el dominio público
 *   `www.avalonpremier.com.ar`, no la URL default del proyecto en Vercel.
 */
function premierRedirectBase(peerFromBrand: string): string {
  if (typeof process !== 'undefined') {
    const raw = process.env.PREMIER_SITE_URL?.trim() || process.env.PREMIER_REDIRECT_URL?.trim();
    if (raw) return baseNoSlash(raw);
  }
  const b = baseNoSlash(peerFromBrand);
  if (!b || !isAbsoluteHttpUrl(b)) {
    return FALLBACK_PREMIER_ORIGIN;
  }
  try {
    const host = new URL(b).hostname;
    if (host.endsWith('.vercel.app')) {
      return FALLBACK_PREMIER_ORIGIN;
    }
  } catch {
    return FALLBACK_PREMIER_ORIGIN;
  }
  return b;
}

/** ID desde `508473` o slug `508473-propiedad` (también `parseInt` corta en el guion). */
export function parseKitepropEntryId(segment: string): number | null {
  const fromSlug = parsePropertySlugParam(segment);
  if (fromSlug != null) return fromSlug;
  const n = Number.parseInt(segment, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/**
 * Entrada KiteProp (varias rutas legacy): redirige a `/propiedades/{slug}` en Avalon o en Premier.
 * Conserva query string (p. ej. `fw_uid`) en el destino.
 */
export async function kitepropEntryRedirect(request: NextRequest, segment: string): Promise<NextResponse> {
  const qs = request.nextUrl.search;

  const id = parseKitepropEntryId(segment);
  if (id == null) {
    return NextResponse.redirect(new URL(`/propiedades${qs}`, request.url), 302);
  }

  const rawList = await loadKitepropCatalogMerged();
  const raw = rawList.find((r) => r.id === id);
  if (!raw) {
    return NextResponse.redirect(new URL(`/propiedades${qs}`, request.url), 302);
  }

  const brand = getSiteBrandConfig('avalon');
  const slug = buildPropertySlug(raw);
  const path = `/propiedades/${slug}`;

  const targetBase = isPremierSiteListable(raw)
    ? premierRedirectBase(brand.urls.peerSite)
    : baseNoSlash(brand.urls.base);

  const href = `${targetBase}${path}${qs}`;
  const res = NextResponse.redirect(href, 301);
  res.headers.set('Link', `<${href}>; rel="canonical"`);
  return res;
}

/**
 * URL absoluta de la ficha en Premier cuando el aviso no está en el listado Avalon pero sí en Premier.
 */
export function premierPropertyListingUrl(raw: RawProperty): string | null {
  if (!isPremierSiteListable(raw)) return null;
  const brand = getSiteBrandConfig('avalon');
  const slug = buildPropertySlug(raw);
  return `${premierRedirectBase(brand.urls.peerSite)}/propiedades/${slug}`;
}
