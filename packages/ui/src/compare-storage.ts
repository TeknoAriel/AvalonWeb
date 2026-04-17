import type { SiteType } from '@avalon/types';
import {
  ENGAGEMENT_FAVORITES_EVENT,
  isFavorite,
  readFavoriteSnapshots,
  removeFavoriteById,
} from '@avalon/utils';

export const COMPARE_MAX = 5;

export const COMPARE_CHANGE_EVENT = 'avalon-compare-change';

export function compareStorageKey(site: SiteType): string {
  return `avalon_compare_ids_${site}`;
}

function coerceCompareId(x: unknown): number | null {
  if (typeof x === 'number' && Number.isFinite(x)) return Math.trunc(x);
  if (typeof x === 'string') {
    const n = Number.parseInt(x, 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Solo IDs marcados con «Comparar» (localStorage). */
function readStoredCompareIds(site: SiteType): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(compareStorageKey(site));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const ids: number[] = [];
    for (const x of parsed) {
      const n = coerceCompareId(x);
      if (n != null) ids.push(n);
      if (ids.length >= COMPARE_MAX) break;
    }
    return ids;
  } catch {
    return [];
  }
}

/**
 * Conjunto efectivo para comparar: primero los explícitos «Comparar», luego favoritos ☆, sin duplicar, máximo 5.
 */
export function mergeCompareIdsWithFavorites(site: SiteType, explicit: number[]): number[] {
  const favIds = readFavoriteSnapshots(site).map((s) => s.id);
  const out: number[] = [];
  const seen = new Set<number>();
  for (const id of explicit) {
    if (!Number.isFinite(id) || seen.has(id)) continue;
    out.push(id);
    seen.add(id);
    if (out.length >= COMPARE_MAX) return out;
  }
  for (const id of favIds) {
    if (!Number.isFinite(id) || seen.has(id)) continue;
    out.push(id);
    seen.add(id);
    if (out.length >= COMPARE_MAX) break;
  }
  return out;
}

export function readCompareIds(site: SiteType): number[] {
  return mergeCompareIdsWithFavorites(site, readStoredCompareIds(site));
}

export function writeCompareIds(site: SiteType, ids: number[]): void {
  localStorage.setItem(compareStorageKey(site), JSON.stringify(ids.slice(0, COMPARE_MAX)));
}

export function dispatchCompareChange(site: SiteType): void {
  window.dispatchEvent(new CustomEvent(COMPARE_CHANGE_EVENT, { detail: { site } }));
}

export function toggleCompareId(site: SiteType, id: number): {
  ids: number[];
  state: 'added' | 'removed' | 'unchanged';
  reason?: 'max';
} {
  const stored = readStoredCompareIds(site);
  const merged = mergeCompareIdsWithFavorites(site, stored);

  const idx = stored.indexOf(id);
  if (idx >= 0) {
    const next = stored.filter((x) => x !== id);
    writeCompareIds(site, next);
    dispatchCompareChange(site);
    return { ids: readCompareIds(site), state: 'removed' };
  }

  if (merged.includes(id) && !stored.includes(id)) {
    removeFavoriteById(site, id);
    dispatchCompareChange(site);
    return { ids: readCompareIds(site), state: 'removed' };
  }

  if (merged.length >= COMPARE_MAX && !merged.includes(id)) {
    return { ids: merged, state: 'unchanged', reason: 'max' };
  }

  const mergedWithNew = mergeCompareIdsWithFavorites(site, [...stored, id]);
  if (!mergedWithNew.includes(id)) {
    return { ids: merged, state: 'unchanged', reason: 'max' };
  }

  const nextStored = [...stored, id].slice(0, COMPARE_MAX);
  writeCompareIds(site, nextStored);
  dispatchCompareChange(site);
  return { ids: readCompareIds(site), state: 'added' };
}

export function removeCompareId(site: SiteType, id: number): void {
  const stored = readStoredCompareIds(site);
  if (stored.includes(id)) {
    writeCompareIds(
      site,
      stored.filter((x) => x !== id),
    );
  }
  const mergedNow = mergeCompareIdsWithFavorites(site, readStoredCompareIds(site));
  if (mergedNow.includes(id) && isFavorite(site, id)) {
    removeFavoriteById(site, id);
  }
  dispatchCompareChange(site);
}

export function clearCompareIds(site: SiteType): void {
  localStorage.removeItem(compareStorageKey(site));
  dispatchCompareChange(site);
}
