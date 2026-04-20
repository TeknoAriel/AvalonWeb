import type { NormalizedProperty, RawProperty, SiteType } from '@avalon/types';
import { ALL_RAW_PROPERTIES } from './load';
import { isPremierSiteListable, isPubliclyListedForSite } from './listing-rules';
import { normalizeProperty } from './normalize';
import { isPremierInventory } from './premier';
import { pickSmartRelated, type RelatedRankingHints } from './related-scoring';

/** Listado normalizado a partir de un lote raw (feed empaquetado, JSON remoto o snapshot). */
export function getSitePropertiesFromRaw(site: SiteType, rawList: RawProperty[]): NormalizedProperty[] {
  if (site === 'premier') {
    return rawList.filter((r) => isPremierSiteListable(r)).map(normalizeProperty);
  }
  const listed = rawList.filter((r) => isPubliclyListedForSite(r, site));
  return listed.filter((r) => !isPremierInventory(r)).map(normalizeProperty);
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
  if (!raw) return undefined;
  if (site === 'premier') {
    if (!isPremierSiteListable(raw)) return undefined;
  } else {
    if (!isPubliclyListedForSite(raw, site) || isPremierInventory(raw)) return undefined;
  }
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
  hints?: RelatedRankingHints,
): NormalizedProperty[] {
  const pool = getSitePropertiesFromRaw(site, rawList).filter((p) => p.id !== current.id);
  return pickSmartRelated(current, pool, limit, hints ? { hints } : undefined);
}

export function getRelatedProperties(
  site: SiteType,
  current: NormalizedProperty,
  limit = 4,
  hints?: RelatedRankingHints,
): NormalizedProperty[] {
  return getRelatedPropertiesFromRaw(site, current, ALL_RAW_PROPERTIES, limit, hints);
}

/**
 * Resuelve IDs guardados para comparar (p. ej. localStorage) contra el catálogo actual.
 * Misma regla que el listado: sitio + listado público.
 */
export function getNormalizedPropertiesByIdsForSite(
  site: SiteType,
  ids: number[],
  rawList: RawProperty[],
): NormalizedProperty[] {
  const ordered: NormalizedProperty[] = [];
  const seen = new Set<number>();
  for (const id of ids) {
    if (!Number.isFinite(id) || seen.has(id)) continue;
    const p = getPropertyByIdFromRaw(site, id, rawList);
    if (!p) continue;
    ordered.push(p);
    seen.add(id);
  }
  return ordered;
}
