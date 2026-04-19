import type { RawProperty, SiteType } from '@avalon/types';
import { hasPremierTag } from './premier';

/** Normaliza estado CRM para comparar con sets (espacios → `_`, minúsculas). */
function statusKey(raw: RawProperty): string {
  return String(raw.status ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
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

/** Vendido / baja / inactiva: no listar en Premier aunque el CRM siga marcando segmento Premier. */
const STATUS_TERMINAL = new Set([
  'sold',
  'vendido',
  'rented',
  'alquilado',
  'reserved',
  'inactive',
  'inactiva',
  'inactivo',
  'no_disponible',
  'nodisponible',
  'baja',
  'dada_de_baja',
  'fuera_de_mercado',
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
 * **Premier (sitio):** una sola regla alineada con el listado y con `pnpm kp:ingest-stats` → `premierListableCount`:
 * segmento Premier (`hasPremierTag`) y **no** estado terminal (vendido, baja, inactiva, etc.).
 * Cualquier fila Premier “en curso” (activa, unpublished, draft, u otros strings del CRM no terminales) entra.
 */
export function isPremierSiteListable(raw: RawProperty): boolean {
  if (!hasPremierTag(raw)) return false;
  const st = statusKey(raw);
  if (STATUS_TERMINAL.has(st)) return false;
  return true;
}

/**
 * Listado por sitio: Avalon = activos públicos; Premier = `isPremierSiteListable` (ver arriba).
 */
export function isPubliclyListedForSite(raw: RawProperty, site: SiteType): boolean {
  if (site === 'premier') {
    return isPremierSiteListable(raw);
  }
  const st = statusKey(raw);
  return STATUS_ACTIVE_LIKE.has(st);
}
