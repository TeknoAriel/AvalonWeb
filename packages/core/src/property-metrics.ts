import type { NormalizedProperty } from '@avalon/types';

/** Precio numérico de venta si existe en el modelo normalizado (string crudo del feed). */
export function parseListingSalePriceAmount(p: NormalizedProperty): number | null {
  if (!p.operation.forSale || p.operation.salePrice == null || p.operation.salePrice === '') return null;
  const n = Number.parseFloat(String(p.operation.salePrice).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/** Precio de alquiler anual (u operación rent) si existe en el modelo normalizado. */
export function parseListingRentAmount(p: NormalizedProperty): number | null {
  if (!p.operation.forRent || p.operation.rentPrice == null || p.operation.rentPrice === '') return null;
  const n = Number.parseFloat(String(p.operation.rentPrice).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export function parseTotalM2(p: NormalizedProperty): number | null {
  if (p.surfaces.totalM2 == null || p.surfaces.totalM2 === '') return null;
  const n = Number.parseFloat(String(p.surfaces.totalM2).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export function parseCoveredM2(p: NormalizedProperty): number | null {
  if (p.surfaces.coveredM2 == null || p.surfaces.coveredM2 === '') return null;
  const n = Number.parseFloat(String(p.surfaces.coveredM2).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export function hasAmenity(p: NormalizedProperty, id: string): boolean {
  return p.amenities.some((a) => a.id === id);
}

export function pricePerM2(p: NormalizedProperty): number | null {
  const price = parseListingSalePriceAmount(p);
  const m2 = parseTotalM2(p) ?? parseCoveredM2(p);
  if (price == null || m2 == null || m2 <= 0) return null;
  return price / m2;
}
