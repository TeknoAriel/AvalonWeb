import type { RawProperty } from '@avalon/types';
import { nestedRecordPremierCandidates } from './kiteprop-api-mapper';
import { hasPremierSavedListMembership } from './premier-list-membership';

const PREMIER_NORMALIZED = 'premier';

/** Valores explícitos en JSON/API (boolean, 1/0, strings; números ≠ 0 como truthy típico CRM tinyint). */
function explicitPremierBool(v: unknown): boolean | null {
  if (v === undefined || v === null) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  if (typeof v === 'number' && Number.isFinite(v)) {
    if (v === 0) return false;
    return true;
  }
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (['1', 'true', 'yes', 'y', 'on', 'si', 'sí'].includes(s)) return true;
    if (['0', 'false', 'no', 'off'].includes(s)) return false;
  }
  return null;
}

/** Flags CRM en raíz + `attributes` / `meta` / … (mismo orden que el mapper API). */
function premierFlagCandidates(raw: RawProperty): unknown[] {
  const o = raw as unknown as Record<string, unknown>;
  return [
    o.premier,
    o.is_premier,
    o.isPremier,
    o.avalon_premier,
    o['premier_flag'],
    raw.premier,
    raw.is_premier,
    ...nestedRecordPremierCandidates(o),
  ];
}

/**
 * Catálogo REST KiteProp: si algún flag `premier` / `is_premier` (y alias) es **true** en raíz o anidado → segmento Premier.
 * Si no hay ningún `true` y al menos un `false` explícito en esos campos → `false`; si todo ausente → `null`.
 * (Los tags/modificadores se resuelven aparte en `hasPremierTag`.)
 */
function restCatalogPremierFlag(raw: RawProperty): boolean | null {
  let anyFalse = false;
  for (const v of premierFlagCandidates(raw)) {
    const e = explicitPremierBool(v);
    if (e === true) return true;
    if (e === false) anyFalse = true;
  }
  return anyFalse ? false : null;
}

function equalsPremierToken(value: string): boolean {
  return value.trim().toLowerCase() === PREMIER_NORMALIZED;
}

/** Etiquetas tipo "avalon-premier", "Colección Premier", slugs compuestos, etc. */
function stringMentionsPremierWord(value: string): boolean {
  return /\bpremier\b/i.test(value);
}

function scanUnknownList(value: unknown): boolean {
  if (!Array.isArray(value)) return false;
  for (const item of value) {
    if (typeof item === 'string' && (equalsPremierToken(item) || stringMentionsPremierWord(item))) return true;
    if (item && typeof item === 'object') {
      const o = item as Record<string, unknown>;
      for (const k of ['name', 'slug', 'label', 'title', 'key', 'code', 'value', 'keyword']) {
        const v = o[k];
        if (typeof v === 'string' && (equalsPremierToken(v) || stringMentionsPremierWord(v))) return true;
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

/** Tags, labels, categorías y claves CRM tipo modificadores (KiteProp suele mandar Premier ahí aunque `premier` sea 0). */
function scanPremierFromTagLikeFields(raw: RawProperty): boolean {
  if (raw.tags !== undefined) {
    if (typeof raw.tags === 'string') {
      if (equalsPremierToken(raw.tags)) return true;
      if (stringMentionsPremierWord(raw.tags)) return true;
      if (scanStringListCsv(raw.tags)) return true;
      if (scanMaybeJsonStringArray(raw.tags)) return true;
    } else if (scanUnknownList(raw.tags)) return true;
  }

  if (raw.labels !== undefined) {
    if (typeof raw.labels === 'string') {
      if (equalsPremierToken(raw.labels)) return true;
      if (stringMentionsPremierWord(raw.labels)) return true;
      if (scanStringListCsv(raw.labels)) return true;
      if (scanMaybeJsonStringArray(raw.labels)) return true;
    } else if (scanUnknownList(raw.labels)) return true;
  }

  if (raw.categories !== undefined) {
    if (typeof raw.categories === 'string') {
      if (equalsPremierToken(raw.categories)) return true;
      if (stringMentionsPremierWord(raw.categories)) return true;
      if (scanStringListCsv(raw.categories)) return true;
      if (scanMaybeJsonStringArray(raw.categories)) return true;
    } else if (scanUnknownList(raw.categories)) return true;
  }

  const extra = raw as unknown as Record<string, unknown>;
  for (const key of ['segment', 'collection', 'tier', 'class', 'tag', 'tag_slug', 'tier_slug']) {
    const v = extra[key];
    if (typeof v === 'string' && (equalsPremierToken(v) || stringMentionsPremierWord(v))) return true;
  }

  for (const key of [
    'modificadores',
    'modificador',
    'modifiers',
    'property_tags',
    'property_tag_names',
    'tag_names',
    'tag_list',
    'kp_tags',
    'difusion_tags',
    'web_tags',
    'public_tags',
    'featured_tags',
    'groups',
    'collections',
  ]) {
    const v = extra[key];
    if (v === undefined) continue;
    if (typeof v === 'string') {
      if (
        equalsPremierToken(v) ||
        stringMentionsPremierWord(v) ||
        scanStringListCsv(v) ||
        scanMaybeJsonStringArray(v)
      )
        return true;
    } else if (scanUnknownList(v)) return true;
  }

  return false;
}

/**
 * Segmento Premier (feed general → web Premier):
 * 1. Overrides por ID (`PREMIER_PROPERTY_IDS`).
 * 2. Cualquier flag CRM **true** en raíz o anidado (`premier` / `is_premier` / alias) — **prioridad** sobre el resto.
 * 3. Membresía de lista guardada / propsheet si configuraste `KITEPROP_PREMIER_SAVED_LIST_IDS`.
 * 4. Tags, modificadores, labels, etc. (legacy / export JSON).
 * 5. Si hubo solo flags explícitos **false** (sin tag ni lista) → no Premier.
 */
export function hasPremierTag(raw: RawProperty): boolean {
  if (premierOverrideIds().has(raw.id)) return true;

  if (restCatalogPremierFlag(raw) === true) return true;

  if (hasPremierSavedListMembership(raw)) return true;

  if (scanPremierFromTagLikeFields(raw)) return true;

  if (restCatalogPremierFlag(raw) === false) return false;

  return false;
}

export function isPremierInventory(raw: RawProperty): boolean {
  return hasPremierTag(raw);
}
