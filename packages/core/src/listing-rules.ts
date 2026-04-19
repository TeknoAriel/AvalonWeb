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

/**
 * Premier: solo ocultar **cierres definitivos**. Strings tipo `inactive` / `baja` en la API a veces no
 * coinciden con “fuera de cartera” en el CRM; si el segmento Premier está marcado, no los tratamos como terminal aquí.
 */
const STATUS_TERMINAL_PREMIER_SITE = new Set([
  'sold',
  'vendido',
  'rented',
  'alquilado',
  'archived',
  'deleted',
  'cancelled',
  'cancelado',
  'reserved',
]);

/** Catálogo Avalon estándar: solo `active` (valor del JSON/API KiteProp). */
export function isPubliclyListed(raw: RawProperty): boolean {
  const st = statusKey(raw);
  return st === 'active' || STATUS_ACTIVE_LIKE.has(st);
}

/**
 * **Premier (sitio):** alineado con `pnpm kp:ingest-stats` → `premierListableCount`:
 * `hasPremierTag` y **no** cierre definitivo (`sold`, `archived`, `deleted`, … — ver `STATUS_TERMINAL_PREMIER_SITE`).
 * Estados ambiguos del feed (`inactive`, `baja`, …) **no** sacan del listado Premier.
 */
export function isPremierSiteListable(raw: RawProperty): boolean {
  if (!hasPremierTag(raw)) return false;
  const st = statusKey(raw);
  if (STATUS_TERMINAL_PREMIER_SITE.has(st)) return false;
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
