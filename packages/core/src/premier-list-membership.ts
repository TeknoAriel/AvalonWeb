import type { RawProperty } from '@avalon/types';

/**
 * KiteProp guarda “Premier” a veces como **lista / propsheet** (ej. `/propsheet/saved/348/0138`),
 * no como tag en `tags[]`. Si la API incluye esos IDs en campos anidados, los enlazamos acá.
 *
 * Variables (opcional, servidor):
 *   `KITEPROP_PREMIER_SAVED_LIST_IDS` — coma: `0138,138` (se normalizan variantes con/sin ceros).
 *   Alias: `KITEPROP_PREMIER_PROPSHEET_ID` — un solo id.
 */
const MEMBERSHIP_VALUE_KEYS = [
  'saved_lists',
  'saved_list_ids',
  'lists',
  'list_ids',
  'propsheet_ids',
  'saved_filter_ids',
  'smart_list_ids',
  'filter_ids',
  'groups',
  'collections',
  'labels',
  'categories',
  'tags',
  'modificadores',
  'modifiers',
  'property_tags',
  'kp_tags',
] as const;

const NESTED_OBJECT_KEYS = ['attributes', 'meta', 'settings', 'publication', 'metrics'] as const;

const OBJECT_ID_KEYS = ['id', 'list_id', 'saved_list_id', 'propsheet_id', 'saved_filter_id', 'filter_id'] as const;

function readPremierListIdEnvRaw(): string {
  return (
    (typeof process !== 'undefined' && process.env.KITEPROP_PREMIER_SAVED_LIST_IDS?.trim()) ||
    (typeof process !== 'undefined' && process.env.KITEPROP_PREMIER_PROPSHEET_ID?.trim()) ||
    ''
  );
}

/** IDs de lista/propsheet “Premier” desde env (vacío = no usar esta heurística). */
export function premierSavedListIdSet(): Set<string> {
  const raw = readPremierListIdEnvRaw();
  const set = new Set<string>();
  for (const part of raw.split(/[,\s;|]+/).map((s) => s.trim()).filter(Boolean)) {
    set.add(part);
    const n = Number.parseInt(part, 10);
    if (!Number.isNaN(n)) {
      set.add(String(n));
      if (part.length >= 3) set.add(part.replace(/^0+/, '') || '0');
    }
  }
  return set;
}

function idMatchesAllowed(v: unknown, allowed: Set<string>): boolean {
  if (v === undefined || v === null) return false;
  const s = String(v).trim();
  if (!s) return false;
  if (allowed.has(s)) return true;
  const n = Number.parseInt(s, 10);
  if (Number.isNaN(n)) return false;
  if (allowed.has(String(n))) return true;
  for (const a of allowed) {
    const an = Number.parseInt(a, 10);
    if (!Number.isNaN(an) && an === n) return true;
  }
  return false;
}

function walkForListId(value: unknown, allowed: Set<string>): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return idMatchesAllowed(value, allowed);
  }
  if (typeof value === 'string') {
    const parts = value.split(/[,\s;|]+/).map((p) => p.trim()).filter(Boolean);
    if (parts.some((p) => idMatchesAllowed(p, allowed))) return true;
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed !== value) return walkForListId(parsed, allowed);
    } catch {
      /* ignore */
    }
    return false;
  }
  if (Array.isArray(value)) {
    return value.some((item) => walkForListId(item, allowed));
  }
  if (typeof value === 'object') {
    const o = value as Record<string, unknown>;
    for (const k of OBJECT_ID_KEYS) {
      if (walkForListId(o[k], allowed)) return true;
    }
    for (const k of MEMBERSHIP_VALUE_KEYS) {
      if (walkForListId(o[k], allowed)) return true;
    }
  }
  return false;
}

/**
 * True si el registro API parece pertenecer a una lista/propsheet Premier configurada en env.
 */
export function hasPremierSavedListMembership(raw: RawProperty): boolean {
  const allowed = premierSavedListIdSet();
  if (allowed.size === 0) return false;
  const row = raw as unknown as Record<string, unknown>;
  for (const key of MEMBERSHIP_VALUE_KEYS) {
    if (walkForListId(row[key], allowed)) return true;
  }
  for (const nest of NESTED_OBJECT_KEYS) {
    const inner = row[nest];
    if (!inner || typeof inner !== 'object' || Array.isArray(inner)) continue;
    const n = inner as Record<string, unknown>;
    for (const key of MEMBERSHIP_VALUE_KEYS) {
      if (walkForListId(n[key], allowed)) return true;
    }
  }
  return false;
}
