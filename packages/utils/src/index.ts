import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Decodifica entidades HTML mínimas para previews de texto */
export function decodeBasicEntities(html: string): string {
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export function stripHtml(html: string): string {
  const decoded = decodeBasicEntities(html);
  return decoded.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export { buildYouTubeNoCookieEmbedUrl, extractYouTubeVideoId, toYouTubeEmbedUrl } from './youtube';

export { trackAvalonEvent } from './analytics';
export {
  addSavedSearch,
  ENGAGEMENT_FAVORITES_EVENT,
  ENGAGEMENT_RECENTS_EVENT,
  ENGAGEMENT_SAVED_EVENT,
  isFavorite,
  readFavoriteSnapshots,
  readRecentSnapshots,
  readSavedSearches,
  recordPropertyView,
  toggleFavoriteSnapshot,
  writeFavoriteSnapshots,
  writeSavedSearches,
  type FavoriteSnapshot,
  type RecentSnapshot,
  type SavedSearchSnapshot,
} from './engagement';

export function formatMoneyAmount(raw: string | null | undefined, currency: string): string | null {
  if (raw == null || raw === '') return null;
  const n = Number.parseFloat(raw);
  if (Number.isNaN(n)) return null;
  const cur = currency?.toLowerCase() === 'usd' ? 'USD' : 'ARS';
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: cur === 'USD' ? 'USD' : 'ARS',
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${cur} ${n.toLocaleString('es-AR')}`;
  }
}
