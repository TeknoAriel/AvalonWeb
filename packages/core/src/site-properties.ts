import type { NormalizedProperty, RawProperty, SiteType } from '@avalon/types';
import { ALL_RAW_PROPERTIES } from './load';
import { isPubliclyListed } from './listing-rules';
import { normalizeProperty } from './normalize';
import { isPremierInventory } from './premier';

/** Listado normalizado a partir de un lote raw (feed empaquetado, JSON remoto o snapshot). */
export function getSitePropertiesFromRaw(site: SiteType, rawList: RawProperty[]): NormalizedProperty[] {
  const listed = rawList.filter(isPubliclyListed);
  const filtered =
    site === 'premier'
      ? listed.filter((r) => isPremierInventory(r))
      : listed.filter((r) => !isPremierInventory(r));

  return filtered.map(normalizeProperty);
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
  if (!raw || !isPubliclyListed(raw)) return undefined;
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
  const sameZone = pool.filter(
    (p) => p.location.zone === current.location.zone && p.propertyType === current.propertyType,
  );
  const sameCity = pool.filter((p) => p.location.city === current.location.city);
  const merged = [...sameZone, ...sameCity, ...pool];
  const seen = new Set<number>();
  const out: NormalizedProperty[] = [];
  for (const p of merged) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
    if (out.length >= limit) break;
  }
  return out;
}

export function getRelatedProperties(
  site: SiteType,
  current: NormalizedProperty,
  limit = 4,
): NormalizedProperty[] {
  return getRelatedPropertiesFromRaw(site, current, ALL_RAW_PROPERTIES, limit);
}
