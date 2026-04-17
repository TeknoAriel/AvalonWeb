import type { SiteType } from '@avalon/types';
import { trackAvalonEvent } from './analytics';

const V = 1 as const;

export type FavoriteSnapshot = {
  id: number;
  slug: string;
  title: string;
  thumbUrl: string | null;
  subtitle: string;
};

export type RecentSnapshot = FavoriteSnapshot & { viewedAt: string };

export type SavedSearchSnapshot = {
  id: string;
  name: string;
  createdAt: string;
  /** Query serializada (URLSearchParams string) */
  query: string;
};

function favKey(site: SiteType) {
  return `avalon_fav_v${V}_${site}`;
}
function recentKey(site: SiteType) {
  return `avalon_recent_v${V}_${site}`;
}
function savedKey(site: SiteType) {
  return `avalon_savedsearch_v${V}_${site}`;
}

export const ENGAGEMENT_FAVORITES_EVENT = 'avalon:engagement:favorites';
export const ENGAGEMENT_RECENTS_EVENT = 'avalon:engagement:recents';
export const ENGAGEMENT_SAVED_EVENT = 'avalon:engagement:saved';

function dispatch(name: string, site: SiteType) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(name, { detail: { site } }));
}

function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function readFavoriteSnapshots(site: SiteType): FavoriteSnapshot[] {
  if (typeof window === 'undefined') return [];
  const list = parseJson<FavoriteSnapshot[]>(localStorage.getItem(favKey(site)));
  return Array.isArray(list) ? list.filter((x) => x && typeof x.id === 'number') : [];
}

export function writeFavoriteSnapshots(site: SiteType, list: FavoriteSnapshot[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(favKey(site), JSON.stringify(list.slice(0, 80)));
  dispatch(ENGAGEMENT_FAVORITES_EVENT, site);
}

export function isFavorite(site: SiteType, id: number): boolean {
  return readFavoriteSnapshots(site).some((x) => x.id === id);
}

/** Quita un favorito por id (p. ej. al sacarlo del conjunto comparar cuando solo estaba en ☆ Fav). */
export function removeFavoriteById(site: SiteType, id: number): boolean {
  const cur = readFavoriteSnapshots(site);
  if (!cur.some((x) => x.id === id)) return false;
  writeFavoriteSnapshots(
    site,
    cur.filter((x) => x.id !== id),
  );
  trackAvalonEvent('property_unfavorited', { property_id: id, site });
  return true;
}

export function toggleFavoriteSnapshot(site: SiteType, snap: FavoriteSnapshot): boolean {
  const cur = readFavoriteSnapshots(site);
  const idx = cur.findIndex((x) => x.id === snap.id);
  let next: FavoriteSnapshot[];
  let nowFav: boolean;
  if (idx >= 0) {
    next = cur.filter((x) => x.id !== snap.id);
    nowFav = false;
    trackAvalonEvent('property_unfavorited', { property_id: snap.id, site });
  } else {
    next = [snap, ...cur.filter((x) => x.id !== snap.id)];
    nowFav = true;
    trackAvalonEvent('property_favorited', { property_id: snap.id, site });
  }
  writeFavoriteSnapshots(site, next);
  return nowFav;
}

const MAX_RECENTS = 14;

export function readRecentSnapshots(site: SiteType): RecentSnapshot[] {
  if (typeof window === 'undefined') return [];
  const list = parseJson<RecentSnapshot[]>(localStorage.getItem(recentKey(site)));
  return Array.isArray(list) ? list : [];
}

export function recordPropertyView(site: SiteType, snap: Omit<RecentSnapshot, 'viewedAt'>): void {
  if (typeof window === 'undefined') return;
  const now = new Date().toISOString();
  const entry: RecentSnapshot = { ...snap, viewedAt: now };
  const cur = readRecentSnapshots(site).filter((x) => x.id !== snap.id);
  const next = [entry, ...cur].slice(0, MAX_RECENTS);
  localStorage.setItem(recentKey(site), JSON.stringify(next));
  dispatch(ENGAGEMENT_RECENTS_EVENT, site);
  trackAvalonEvent('property_viewed', { property_id: snap.id, site });
}

export function readSavedSearches(site: SiteType): SavedSearchSnapshot[] {
  if (typeof window === 'undefined') return [];
  const list = parseJson<SavedSearchSnapshot[]>(localStorage.getItem(savedKey(site)));
  return Array.isArray(list) ? list : [];
}

export function writeSavedSearches(site: SiteType, list: SavedSearchSnapshot[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(savedKey(site), JSON.stringify(list.slice(0, 30)));
  dispatch(ENGAGEMENT_SAVED_EVENT, site);
}

export function addSavedSearch(site: SiteType, rec: SavedSearchSnapshot): void {
  const cur = readSavedSearches(site).filter((s) => s.id !== rec.id);
  writeSavedSearches(site, [rec, ...cur]);
  trackAvalonEvent('search_saved', { search_id: rec.id, site });
}
