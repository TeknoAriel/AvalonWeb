import type { NormalizedProperty, SiteType } from '@avalon/types';
import { ALL_RAW_PROPERTIES } from './load';
import { isPubliclyListed } from './listing-rules';
import { normalizeProperty } from './normalize';
import { isPremierInventory } from './premier';

export function getSiteProperties(site: SiteType): NormalizedProperty[] {
  const listed = ALL_RAW_PROPERTIES.filter(isPubliclyListed);
  const filtered =
    site === 'premier'
      ? listed.filter((r) => isPremierInventory(r))
      : listed.filter((r) => !isPremierInventory(r));

  return filtered.map(normalizeProperty);
}

export function getAllNormalizedProperties(): NormalizedProperty[] {
  return ALL_RAW_PROPERTIES.map(normalizeProperty);
}

export function getPropertyById(site: SiteType, id: number): NormalizedProperty | undefined {
  const raw = ALL_RAW_PROPERTIES.find((r) => r.id === id);
  if (!raw || !isPubliclyListed(raw)) return undefined;
  const premier = isPremierInventory(raw);
  if (site === 'premier' && !premier) return undefined;
  if (site === 'avalon' && premier) return undefined;
  return normalizeProperty(raw);
}

export function getRelatedProperties(
  site: SiteType,
  current: NormalizedProperty,
  limit = 4
): NormalizedProperty[] {
  const pool = getSiteProperties(site).filter((p) => p.id !== current.id);
  const sameZone = pool.filter(
    (p) => p.location.zone === current.location.zone && p.propertyType === current.propertyType
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
