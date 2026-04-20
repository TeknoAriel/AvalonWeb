import type { RawProperty } from '@avalon/types';

export interface EditorialSignals {
  isFeatured: boolean;
  priorityRank: number | null;
}

const FEATURED_TRUE_TOKENS = new Set([
  'featured',
  'feature',
  'destacada',
  'destacado',
  'seleccion',
  'selección',
  'exclusiva',
  'exclusive',
  'propiedad_destacada',
  'home_featured',
]);

const TAG_LIKE_KEYS = [
  'tags',
  'labels',
  'categories',
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
] as const;

const FEATURED_BOOL_KEYS = [
  'featured',
  'is_featured',
  'isFeatured',
  'destacada',
  'destacado',
  'is_highlighted',
  'highlighted',
] as const;

const PRIORITY_KEYS = [
  'editorial_priority',
  'editorialPriority',
  'priority',
  'prioridad',
  'rank',
  'ranking',
  'order_rank',
  'listing_priority',
] as const;

function asciiLower(v: string): string {
  return v.trim().toLowerCase();
}

function compactToken(v: string): string {
  return asciiLower(v).normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function isTruthyLike(v: unknown): boolean {
  if (v === true || v === 1) return true;
  if (typeof v === 'number') return Number.isFinite(v) && v > 0;
  if (typeof v !== 'string') return false;
  const s = compactToken(v);
  return ['1', 'true', 'yes', 'si', 'on'].includes(s);
}

function rankFromLetter(letter: string): number | null {
  const c = compactToken(letter);
  if (!/^[a-z]$/.test(c)) return null;
  return c.charCodeAt(0) - 96;
}

function parsePriorityToken(v: string): number | null {
  const raw = compactToken(v);
  if (!raw) return null;

  const directNum = Number.parseInt(raw, 10);
  if (Number.isFinite(directNum) && directNum > 0) return directNum;

  const letterOnly = rankFromLetter(raw);
  if (letterOnly != null) return letterOnly;

  const pattern =
    /(?:^|[\s:_\-\[\(])(prio|prioridad|priority|editorial|orden)\s*[:_\- ]*([a-z]|\d{1,2})(?:$|[\s\]\)])/i;
  const m = raw.match(pattern);
  if (!m) return null;
  const value = m[2];
  const letterRank = rankFromLetter(value);
  if (letterRank != null) return letterRank;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function extractStrings(value: unknown): string[] {
  if (typeof value === 'string') {
    const base = value.trim();
    if (!base) return [];
    const split = base.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
    return split.length > 1 ? split : [base];
  }
  if (Array.isArray(value)) {
    const out: string[] = [];
    for (const item of value) {
      if (typeof item === 'string') {
        const t = item.trim();
        if (t) out.push(t);
        continue;
      }
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        for (const key of ['name', 'slug', 'label', 'title', 'key', 'code', 'value']) {
          const v = obj[key];
          if (typeof v === 'string' && v.trim()) out.push(v.trim());
        }
      }
    }
    return out;
  }
  return [];
}

function collectTagLikeTokens(raw: Record<string, unknown>): string[] {
  const out: string[] = [];
  for (const key of TAG_LIKE_KEYS) {
    const value = raw[key];
    if (value === undefined || value === null) continue;
    out.push(...extractStrings(value));
  }
  return out;
}

function resolvePriorityRank(raw: Record<string, unknown>, tagTokens: string[]): number | null {
  for (const key of PRIORITY_KEYS) {
    const value = raw[key];
    if (value === undefined || value === null) continue;
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) return Math.trunc(value);
    if (typeof value === 'string') {
      const parsed = parsePriorityToken(value);
      if (parsed != null) return parsed;
    }
  }

  for (const token of tagTokens) {
    const parsed = parsePriorityToken(token);
    if (parsed != null) return parsed;
  }

  return null;
}

function resolveIsFeatured(raw: Record<string, unknown>, tagTokens: string[]): boolean {
  for (const key of FEATURED_BOOL_KEYS) {
    if (isTruthyLike(raw[key])) return true;
  }

  for (const token of tagTokens) {
    const normalized = compactToken(token);
    if (FEATURED_TRUE_TOKENS.has(normalized)) return true;
  }
  return false;
}

/**
 * Normaliza señales editoriales del feed para orden de listados y módulos curados.
 * No expone formato original (A/B/C, flags, aliases) al consumidor de UI.
 */
export function getEditorialSignals(rawProperty: RawProperty): EditorialSignals {
  const raw = rawProperty as unknown as Record<string, unknown>;
  const tagTokens = collectTagLikeTokens(raw);
  const priorityRank = resolvePriorityRank(raw, tagTokens);
  const isFeatured = resolveIsFeatured(raw, tagTokens);
  return { isFeatured, priorityRank };
}
