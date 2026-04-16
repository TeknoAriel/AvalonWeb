import type { RawProperty, SiteType } from '@avalon/types';

function statusKey(raw: RawProperty): string {
  return String(raw.status ?? '').trim().toLowerCase();
}

/** Catálogo Avalon estándar: solo `active` (valor del JSON/API KiteProp). */
export function isPubliclyListed(raw: RawProperty): boolean {
  return statusKey(raw) === 'active';
}

/** Premier: activos publicados o borrador visible en CRM (`active_unpublished`). */
export function isPubliclyListedForSite(raw: RawProperty, site: SiteType): boolean {
  const st = statusKey(raw);
  if (st === 'active') return true;
  if (site === 'premier' && st === 'active_unpublished') return true;
  return false;
}
