import type { RawProperty } from '@avalon/types';

const PREMIER_NORMALIZED = 'premier';

function equalsPremierToken(value: string): boolean {
  return value.trim().toLowerCase() === PREMIER_NORMALIZED;
}

function scanUnknownList(value: unknown): boolean {
  if (!Array.isArray(value)) return false;
  for (const item of value) {
    if (typeof item === 'string' && equalsPremierToken(item)) return true;
    if (item && typeof item === 'object') {
      const o = item as Record<string, unknown>;
      for (const k of ['name', 'slug', 'label', 'title', 'key']) {
        const v = o[k];
        if (typeof v === 'string' && equalsPremierToken(v)) return true;
      }
    }
  }
  return false;
}

function readPremierOverrideIds(): Set<number> {
  const raw =
    (typeof process !== 'undefined' && process.env.PREMIER_PROPERTY_IDS) ||
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_PREMIER_PROPERTY_IDS) ||
    '';
  const set = new Set<number>();
  for (const part of raw.split(/[,\s]+/).filter(Boolean)) {
    const n = Number.parseInt(part, 10);
    if (!Number.isNaN(n)) set.add(n);
  }
  return set;
}

let cachedOverride: Set<number> | null = null;
function premierOverrideIds(): Set<number> {
  if (!cachedOverride) cachedOverride = readPremierOverrideIds();
  return cachedOverride;
}

/**
 * Detecta si la propiedad pertenece al segmento Premier.
 * Fuentes: tags/labels/categorías (varias formas), flags booleanos, lista opcional por ID (env).
 */
function scanStringListCsv(value: string): boolean {
  const parts = value.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
  return parts.some((p) => equalsPremierToken(p));
}

function scanMaybeJsonStringArray(value: string): boolean {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (typeof parsed === 'string') return equalsPremierToken(parsed);
    return scanUnknownList(parsed);
  } catch {
    return false;
  }
}

export function hasPremierTag(raw: RawProperty): boolean {
  if (raw.premier === true || raw.is_premier === true) return true;

  if (premierOverrideIds().has(raw.id)) return true;

  if (raw.tags !== undefined) {
    if (typeof raw.tags === 'string') {
      if (equalsPremierToken(raw.tags)) return true;
      if (scanStringListCsv(raw.tags)) return true;
      if (scanMaybeJsonStringArray(raw.tags)) return true;
    } else if (scanUnknownList(raw.tags)) return true;
  }

  if (raw.labels !== undefined) {
    if (typeof raw.labels === 'string') {
      if (equalsPremierToken(raw.labels)) return true;
      if (scanStringListCsv(raw.labels)) return true;
      if (scanMaybeJsonStringArray(raw.labels)) return true;
    } else if (scanUnknownList(raw.labels)) return true;
  }

  if (raw.categories !== undefined) {
    if (typeof raw.categories === 'string') {
      if (equalsPremierToken(raw.categories)) return true;
      if (scanStringListCsv(raw.categories)) return true;
      if (scanMaybeJsonStringArray(raw.categories)) return true;
    } else if (scanUnknownList(raw.categories)) return true;
  }

  const extra = raw as unknown as Record<string, unknown>;
  for (const key of ['segment', 'collection', 'tier', 'class', 'tag', 'tag_slug', 'tier_slug']) {
    const v = extra[key];
    if (typeof v === 'string' && equalsPremierToken(v)) return true;
  }

  for (const key of [
    'property_tags',
    'property_tag_names',
    'tag_names',
    'tag_list',
    'kp_tags',
    'groups',
    'collections',
  ]) {
    const v = extra[key];
    if (v === undefined) continue;
    if (typeof v === 'string') {
      if (equalsPremierToken(v) || scanStringListCsv(v) || scanMaybeJsonStringArray(v)) return true;
    } else if (scanUnknownList(v)) return true;
  }

  return false;
}

export function isPremierInventory(raw: RawProperty): boolean {
  return hasPremierTag(raw);
}
