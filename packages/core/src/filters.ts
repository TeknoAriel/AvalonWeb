import type { NormalizedProperty } from '@avalon/types';

export type OperationFilter = 'all' | 'sale' | 'rent' | 'temp';

export interface PropertyListFilters {
  operation?: OperationFilter;
  propertyType?: string;
  city?: string;
  zone?: string;
  q?: string;
}

export function filterNormalizedProperties(
  list: NormalizedProperty[],
  f: PropertyListFilters
): NormalizedProperty[] {
  return list.filter((p) => {
    if (f.operation && f.operation !== 'all') {
      if (f.operation === 'sale' && !p.operation.forSale) return false;
      if (f.operation === 'rent' && !p.operation.forRent) return false;
      if (f.operation === 'temp' && !p.operation.forTempRental) return false;
    }
    if (f.propertyType && f.propertyType !== 'all' && p.propertyType !== f.propertyType) {
      return false;
    }
    if (f.city && f.city !== 'all' && p.location.city !== f.city) return false;
    if (f.zone && f.zone !== 'all') {
      const z = f.zone.toLowerCase();
      if (
        !p.location.zone.toLowerCase().includes(z) &&
        !p.location.zoneSecondary.toLowerCase().includes(z)
      ) {
        return false;
      }
    }
    if (f.q && f.q.trim()) {
      const needle = f.q.trim().toLowerCase();
      const hay = `${p.title} ${p.plainDescription} ${p.location.address} ${p.location.zone} ${p.location.city}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}

export function sortByFeaturedThenRecent(list: NormalizedProperty[]): NormalizedProperty[] {
  const statusRank = (s: string) => {
    if (s === 'active') return 0;
    if (s === 'reserved') return 1;
    return 2;
  };
  return [...list].sort((a, b) => {
    const sr = statusRank(a.status) - statusRank(b.status);
    if (sr !== 0) return sr;
    return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime();
  });
}
