import type { NormalizedProperty } from '@avalon/types';
import {
  hasAmenity,
  parseListingSalePriceAmount,
  parseCoveredM2,
  parseTotalM2,
  pricePerM2,
} from './property-metrics';

function scoreCandidate(current: NormalizedProperty, cand: NormalizedProperty): number {
  let s = 0;
  const z1 = current.location.zone?.toLowerCase() ?? '';
  const z2 = cand.location.zone?.toLowerCase() ?? '';
  if (z1 && z2 && z1 === z2) s += 50;
  else if (
    current.location.city &&
    cand.location.city &&
    current.location.city === cand.location.city
  ) {
    s += 25;
  }
  if (current.propertyType === cand.propertyType) s += 20;
  const opMatch =
    (current.operation.forSale && cand.operation.forSale) ||
    (current.operation.forRent && cand.operation.forRent) ||
    (current.operation.forTempRental && cand.operation.forTempRental);
  if (opMatch) s += 15;

  const p0 = parseListingSalePriceAmount(current);
  const p1 = parseListingSalePriceAmount(cand);
  if (p0 != null && p1 != null && p0 > 0) {
    const ratio = p1 / p0;
    if (ratio >= 0.75 && ratio <= 1.35) s += 18;
    else if (ratio >= 0.55 && ratio <= 1.55) s += 8;
  }

  const b0 = current.rooms.bedrooms;
  const b1 = cand.rooms.bedrooms;
  if (b0 > 0 && b1 > 0 && Math.abs(b0 - b1) <= 1) s += 10;

  const m0 = parseTotalM2(current) ?? parseCoveredM2(current);
  const m1 = parseTotalM2(cand) ?? parseCoveredM2(cand);
  if (m0 != null && m1 != null && m0 > 0) {
    const rm = m1 / m0;
    if (rm >= 0.8 && rm <= 1.4) s += 8;
  }

  const amenityOverlap = current.amenities.filter((a) => hasAmenity(cand, a.id)).length;
  s += Math.min(12, amenityOverlap * 3);

  const ppm0 = pricePerM2(current);
  const ppm1 = pricePerM2(cand);
  if (ppm0 != null && ppm1 != null && ppm0 > 0) {
    const r = ppm1 / ppm0;
    if (r >= 0.85 && r <= 1.2) s += 6;
  }

  return s;
}

/**
 * Ordena candidatos por similitud útil (zona, precio, tipo, operación, dormitorios, amenities).
 * Completa con el resto del pool si hace falta llegar a `limit`.
 */
export function pickSmartRelated(
  current: NormalizedProperty,
  poolExcludingCurrent: NormalizedProperty[],
  limit: number,
): NormalizedProperty[] {
  const scored = poolExcludingCurrent
    .map((p) => ({ p, score: scoreCandidate(current, p) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
  const seen = new Set<number>();
  const out: NormalizedProperty[] = [];
  for (const { p } of scored) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
    if (out.length >= limit) break;
  }
  if (out.length >= limit) return out;
  for (const p of poolExcludingCurrent) {
    if (p.id === current.id || seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
    if (out.length >= limit) break;
  }
  return out;
}
