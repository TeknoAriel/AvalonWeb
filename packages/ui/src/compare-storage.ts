import type { SiteType } from '@avalon/types';

export const COMPARE_MAX = 5;

export const COMPARE_CHANGE_EVENT = 'avalon-compare-change';

export function compareStorageKey(site: SiteType): string {
  return `avalon_compare_ids_${site}`;
}

export function readCompareIds(site: SiteType): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(compareStorageKey(site));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is number => typeof x === 'number').slice(0, COMPARE_MAX);
  } catch {
    return [];
  }
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
  const current = readCompareIds(site);
  const idx = current.indexOf(id);
  if (idx >= 0) {
    const next = current.filter((x) => x !== id);
    writeCompareIds(site, next);
    dispatchCompareChange(site);
    return { ids: next, state: 'removed' };
  }
  if (current.length >= COMPARE_MAX) {
    return { ids: current, state: 'unchanged', reason: 'max' };
  }
  const next = [...current, id];
  writeCompareIds(site, next);
  dispatchCompareChange(site);
  return { ids: next, state: 'added' };
}

export function removeCompareId(site: SiteType, id: number): void {
  writeCompareIds(
    site,
    readCompareIds(site).filter((x) => x !== id)
  );
  dispatchCompareChange(site);
}

export function clearCompareIds(site: SiteType): void {
  localStorage.removeItem(compareStorageKey(site));
  dispatchCompareChange(site);
}
