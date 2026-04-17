import type { RawProperty, SiteType } from '@avalon/types';
import { hasPremierTag } from './premier';

function statusKey(raw: RawProperty): string {
  return String(raw.status ?? '').trim().toLowerCase();
}

/** Estados que KiteProp / CRM suelen usar como “en mercado” (además de `active`). */
const STATUS_ACTIVE_LIKE = new Set([
  'active',
  'activo',
  'published',
  'publicada',
  'publicado',
  'online',
  'enabled',
  'enable',
  'visible',
  'live',
  '1',
  'true',
]);

const STATUS_UNPUBLISHED_PREMIER = new Set(['active_unpublished', 'unpublished', 'draft', 'borrador', 'private']);

/** Vendido / baja: no listar aunque tenga flag Premier. */
const STATUS_TERMINAL = new Set([
  'sold',
  'vendido',
  'rented',
  'alquilado',
  'reserved',
  'inactive',
  'suspended',
  'deleted',
  'archived',
  'cancelled',
  'cancelado',
]);

/** Catálogo Avalon estándar: solo `active` (valor del JSON/API KiteProp). */
export function isPubliclyListed(raw: RawProperty): boolean {
  const st = statusKey(raw);
  return st === 'active' || STATUS_ACTIVE_LIKE.has(st);
}

/**
 * Listado por sitio: sinónimos de “activo” en API; en Premier también unpublished y,
 * si el registro ya es Premier (`hasPremierTag`), cualquier estado no terminal (CRM puede usar otros strings).
 */
export function isPubliclyListedForSite(raw: RawProperty, site: SiteType): boolean {
  const st = statusKey(raw);
  if (STATUS_ACTIVE_LIKE.has(st)) return true;
  if (site === 'premier' && STATUS_UNPUBLISHED_PREMIER.has(st)) return true;
  if (site === 'premier' && hasPremierTag(raw) && !STATUS_TERMINAL.has(st)) return true;
  return false;
}
