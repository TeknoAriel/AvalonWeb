import type { NormalizedProperty, RawProperty, SiteType } from '@avalon/types';
import { ALL_RAW_PROPERTIES } from './load';
import { isPubliclyListedForSite } from './listing-rules';
import { normalizeProperty } from './normalize';
import { passesPremierListingQualityGate } from './premier-curation';
import { isPremierInventory } from './premier';
import { pickSmartRelated } from './related-scoring';

/** Listado normalizado a partir de un lote raw (feed empaquetado, JSON remoto o snapshot). */
export function getSitePropertiesFromRaw(site: SiteType, rawList: RawProperty[]): NormalizedProperty[] {
  const listed = rawList.filter((r) => isPubliclyListedForSite(r, site));
  const filtered =
    site === 'premier'
      ? listed.filter((r) => isPremierInventory(r))
      : listed.filter((r) => !isPremierInventory(r));

  const normalized = filtered.map(normalizeProperty);
  if (site === 'premier') {
    return normalized.filter(passesPremierListingQualityGate);
  }
  return normalized;
}

export function getSiteProperties(site: SiteType): NormalizedProperty[] {
  return getSitePropertiesFromRaw(site, ALL_RAW_PROPERTIES);
}

export function getAllNormalizedProperties(): NormalizedProperty[] {
  return ALL_RAW_PROPERTIES.map(normalizeProperty);
}

export function getPropertyByIdFromRaw(
  site: SiteType,
  id: number,
  rawList: RawProperty[],
): NormalizedProperty | undefined {
  const raw = rawList.find((r) => r.id === id);
  if (!raw || !isPubliclyListedForSite(raw, site)) return undefined;
  const premier = isPremierInventory(raw);
  if (site === 'premier' && !premier) return undefined;
  if (site === 'avalon' && premier) return undefined;
  return normalizeProperty(raw);
}

export function getPropertyById(site: SiteType, id: number): NormalizedProperty | undefined {
  return getPropertyByIdFromRaw(site, id, ALL_RAW_PROPERTIES);
}

export function getRelatedPropertiesFromRaw(
  site: SiteType,
  current: NormalizedProperty,
  rawList: RawProperty[],
  limit = 4,
): NormalizedProperty[] {
  const pool = getSitePropertiesFromRaw(site, rawList).filter((p) => p.id !== current.id);
  return pickSmartRelated(current, pool, limit);
}

export function getRelatedProperties(
  site: SiteType,
  current: NormalizedProperty,
  limit = 4,
): NormalizedProperty[] {
  return getRelatedPropertiesFromRaw(site, current, ALL_RAW_PROPERTIES, limit);
}
