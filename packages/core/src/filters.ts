import type { NormalizedProperty } from '@avalon/types';
import { hasAmenity, parseListingSalePriceAmount, parseTotalM2, parseCoveredM2 } from './property-metrics';

export type OperationFilter = 'all' | 'sale' | 'rent' | 'temp';

export interface PropertyListFilters {
  operation?: OperationFilter;
  propertyType?: string;
  city?: string;
  zone?: string;
  q?: string;
  /** Precio venta mínimo (valor numérico del feed, misma moneda que el listado) */
  minSalePrice?: number;
  maxSalePrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minTotalM2?: number;
  maxTotalM2?: number;
  /** true = solo con al menos una cochera */
  hasParking?: boolean;
  /** true = solo con amenity apto crédito inferida */
  fitCredit?: boolean;
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
    const sale = parseListingSalePriceAmount(p);
    if (f.minSalePrice != null && Number.isFinite(f.minSalePrice)) {
      if (sale == null || sale < f.minSalePrice) return false;
    }
    if (f.maxSalePrice != null && Number.isFinite(f.maxSalePrice)) {
      if (sale == null || sale > f.maxSalePrice) return false;
    }
    if (f.minBedrooms != null && Number.isFinite(f.minBedrooms)) {
      if (p.rooms.bedrooms < f.minBedrooms) return false;
    }
    if (f.minBathrooms != null && Number.isFinite(f.minBathrooms)) {
      if (p.rooms.bathrooms < f.minBathrooms) return false;
    }
    const m2 = parseTotalM2(p) ?? parseCoveredM2(p);
    if (f.minTotalM2 != null && Number.isFinite(f.minTotalM2)) {
      if (m2 == null || m2 < f.minTotalM2) return false;
    }
    if (f.maxTotalM2 != null && Number.isFinite(f.maxTotalM2)) {
      if (m2 == null || m2 > f.maxTotalM2) return false;
    }
    if (f.hasParking === true && p.building.parkings <= 0) return false;
    if (f.fitCredit === true && !hasAmenity(p, 'credit')) return false;
    return true;
  });
}

export interface EditorialListSortOptions {
  /**
   * Dentro del mismo `priorityRank`, orden rotativo estable (no cruza niveles A/B/C).
   * En listados con filtros activos suele desactivarse para priorizar recencia predecible.
   */
  rotateWithinPriorityRank?: boolean;
  /** Semilla estable (p. ej. día); por defecto día UTC actual. */
  rotationSeed?: number;
}

/** Día UTC entero — misma semilla durante ~24h para orden estable al volver atrás. */
export function getEditorialListingDaySeed(): number {
  return Math.floor(Date.now() / 86_400_000);
}

function editorialRotationKey(propertyId: number, seed: number): number {
  const mixed = (propertyId ^ seed) | 0;
  return Math.imul(mixed ^ (mixed >>> 16), 0x7feb352d) >>> 0;
}

function comparePriorityRank(a: NormalizedProperty, b: NormalizedProperty): number {
  const ar = a.editorial.priorityRank;
  const br = b.editorial.priorityRank;
  if (ar != null && br != null && ar !== br) return ar - br;
  if (ar != null && br == null) return -1;
  if (ar == null && br != null) return 1;
  return 0;
}

export function sortByFeaturedThenRecent(
  list: NormalizedProperty[],
  options?: EditorialListSortOptions,
): NormalizedProperty[] {
  const rotate = options?.rotateWithinPriorityRank !== false;
  const seed = options?.rotationSeed ?? getEditorialListingDaySeed();
  return [...list].sort((a, b) => {
    const rankCmp = comparePriorityRank(a, b);
    if (rankCmp !== 0) return rankCmp;

    const fa = a.editorial.isFeatured ? 1 : 0;
    const fb = b.editorial.isFeatured ? 1 : 0;
    if (fa !== fb) return fb - fa;

    if (rotate) {
      const ka = editorialRotationKey(a.id, seed);
      const kb = editorialRotationKey(b.id, seed);
      if (ka !== kb) return ka - kb;
    }

    const ts = new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime();
    if (ts !== 0) return ts;
    return b.id - a.id;
  });
}

export function pickHomeEditorialSelection(list: NormalizedProperty[], limit: number): NormalizedProperty[] {
  const pool = sortByFeaturedThenRecent(list);
  const featured = pool.filter((p) => p.editorial.isFeatured);
  if (featured.length > 0) return featured.slice(0, limit);
  return pool.slice(0, limit);
}
