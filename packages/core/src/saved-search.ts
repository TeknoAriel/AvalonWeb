import type { PropertyListFilters } from './filters';

export const SAVED_SEARCH_SCHEMA_VERSION = 1 as const;

export interface SavedSearchRecord {
  id: string;
  name: string;
  createdAt: string;
  schemaVersion: typeof SAVED_SEARCH_SCHEMA_VERSION;
  filters: PropertyListFilters;
}

/** Serializa para `localStorage`. */
export function serializeSavedSearch(record: SavedSearchRecord): string {
  return JSON.stringify(record);
}

export function parseSavedSearch(raw: string): SavedSearchRecord | null {
  try {
    const o = JSON.parse(raw) as SavedSearchRecord;
    if (!o || typeof o !== 'object') return null;
    if (o.schemaVersion !== SAVED_SEARCH_SCHEMA_VERSION) return null;
    if (typeof o.id !== 'string' || typeof o.name !== 'string' || typeof o.createdAt !== 'string')
      return null;
    if (!o.filters || typeof o.filters !== 'object') return null;
    return o;
  } catch {
    return null;
  }
}
