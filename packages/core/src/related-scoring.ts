import type { NormalizedProperty } from '@avalon/types';
import {
  hasAmenity,
  parseListingRentAmount,
  parseListingSalePriceAmount,
  parseCoveredM2,
  parseTotalM2,
  pricePerM2,
} from './property-metrics';

/** Señales locales opcionales (cliente); peso débil, nunca por encima de ubicación/tipo. */
export type RelatedRankingHints = {
  recentPropertyIds?: readonly number[];
  favoritedPropertyIds?: readonly number[];
  comparedPropertyIds?: readonly number[];
};

export type PickSmartRelatedOptions = {
  hints?: RelatedRankingHints;
};

function norm(s: string | null | undefined): string {
  return (s ?? '').trim().toLowerCase();
}

function zoneMatchScore(cur: NormalizedProperty, cand: NormalizedProperty): number {
  const z0 = norm(cur.location.zone);
  const z1 = norm(cur.location.zoneSecondary);
  const a0 = norm(cand.location.zone);
  const a1 = norm(cand.location.zoneSecondary);
  const zones = [z0, z1].filter((x) => x.length > 0);
  const candZones = [a0, a1].filter((x) => x.length > 0);
  if (!zones.length || !candZones.length) return 0;

  for (const u of zones) {
    for (const v of candZones) {
      if (u === v) return 58;
      if (u.length >= 4 && v.length >= 4 && (u.includes(v) || v.includes(u))) return 40;
    }
  }
  return 0;
}

function sameCity(cur: NormalizedProperty, cand: NormalizedProperty): boolean {
  const a = norm(cur.location.city);
  const b = norm(cand.location.city);
  return Boolean(a && b && a === b);
}

function operationAffinity(cur: NormalizedProperty, cand: NormalizedProperty): number {
  const s = cur.operation.forSale && cand.operation.forSale;
  const r = cur.operation.forRent && cand.operation.forRent;
  const t = cur.operation.forTempRental && cand.operation.forTempRental;
  if (s || r || t) return 24;
  const curAny = cur.operation.forSale || cur.operation.forRent || cur.operation.forTempRental;
  const canAny = cand.operation.forSale || cand.operation.forRent || cand.operation.forTempRental;
  if (curAny && canAny) return 5;
  return 0;
}

function comparablePrices(
  cur: NormalizedProperty,
  cand: NormalizedProperty,
): { curP: number | null; candP: number | null } {
  if (cur.operation.forSale && cand.operation.forSale) {
    return {
      curP: parseListingSalePriceAmount(cur),
      candP: parseListingSalePriceAmount(cand),
    };
  }
  if (cur.operation.forRent && cand.operation.forRent) {
    return {
      curP: parseListingRentAmount(cur),
      candP: parseListingRentAmount(cand),
    };
  }
  return { curP: null, candP: null };
}

function priceBandScore(curP: number, candP: number): number {
  if (curP <= 0 || candP <= 0) return 0;
  const ratio = candP / curP;
  if (ratio >= 0.72 && ratio <= 1.32) return 24;
  if (ratio >= 0.55 && ratio <= 1.65) return 12;
  if (ratio >= 0.4 && ratio <= 2.2) return 4;
  return 0;
}

function bedroomScore(cur: NormalizedProperty, cand: NormalizedProperty): number {
  const b0 = cur.rooms.bedrooms;
  const b1 = cand.rooms.bedrooms;
  if (b0 <= 0 || b1 <= 0) return 0;
  const d = Math.abs(b0 - b1);
  if (d === 0) return 14;
  if (d === 1) return 9;
  if (d === 2) return 4;
  return 0;
}

function bathroomScore(cur: NormalizedProperty, cand: NormalizedProperty): number {
  const b0 = cur.rooms.bathrooms;
  const b1 = cand.rooms.bathrooms;
  if (b0 <= 0 || b1 <= 0) return 0;
  const d = Math.abs(b0 - b1);
  if (d === 0) return 8;
  if (d === 1) return 4;
  return 0;
}

function surfaceScore(cur: NormalizedProperty, cand: NormalizedProperty): number {
  const m0 = parseTotalM2(cur) ?? parseCoveredM2(cur);
  const m1 = parseTotalM2(cand) ?? parseCoveredM2(cand);
  if (m0 == null || m1 == null || m0 <= 0) return 0;
  const rm = m1 / m0;
  if (rm >= 0.78 && rm <= 1.28) return 14;
  if (rm >= 0.62 && rm <= 1.48) return 8;
  if (rm >= 0.5 && rm <= 1.75) return 3;
  return 0;
}

function parkingHint(cur: NormalizedProperty, cand: NormalizedProperty): number {
  if (cur.building.parkings > 0 && cand.building.parkings > 0) return 4;
  return 0;
}

function amenityOverlapScore(cur: NormalizedProperty, cand: NormalizedProperty): number {
  const overlap = cur.amenities.filter((a) => hasAmenity(cand, a.id)).length;
  return Math.min(16, overlap * 2.5);
}

function engagementBonus(id: number, hints?: RelatedRankingHints): number {
  if (!hints) return 0;
  let b = 0;
  if (hints.favoritedPropertyIds?.includes(id)) b += 4;
  if (hints.comparedPropertyIds?.includes(id)) b += 2;
  if (hints.recentPropertyIds?.includes(id)) b += 2;
  return Math.min(6, b);
}

function scoreCandidate(
  current: NormalizedProperty,
  cand: NormalizedProperty,
  hints?: RelatedRankingHints,
): number {
  let s = engagementBonus(cand.id, hints);

  const cityMatch = sameCity(current, cand);
  if (!cityMatch && norm(current.location.city) && norm(cand.location.city)) {
    s -= 48;
  } else if (cityMatch) {
    s += 30;
  }

  s += zoneMatchScore(current, cand);

  if (current.propertyType && current.propertyType === cand.propertyType) {
    s += 22;
  }

  s += operationAffinity(current, cand);

  const { curP, candP } = comparablePrices(current, cand);
  if (curP != null && candP != null) {
    s += priceBandScore(curP, candP);
  }

  s += bedroomScore(current, cand);
  s += bathroomScore(current, cand);
  s += surfaceScore(current, cand);
  s += parkingHint(current, cand);
  s += amenityOverlapScore(current, cand);

  const ppm0 = pricePerM2(current);
  const ppm1 = pricePerM2(cand);
  if (ppm0 != null && ppm1 != null && ppm0 > 0) {
    const r = ppm1 / ppm0;
    if (r >= 0.82 && r <= 1.22) s += 8;
    else if (r >= 0.68 && r <= 1.45) s += 4;
  }

  return s;
}

/**
 * Ordena candidatos por similitud útil (ubicación, operación, tipo, precio comparable, tamaño, amenities).
 * Ordena todo el pool por score (sin descartar candidatos con score bajo) y toma los mejores `limit`.
 * `hints` aplica un bonus débil para recientes / favoritos / comparadas (máx. +6).
 */
export function pickSmartRelated(
  current: NormalizedProperty,
  poolExcludingCurrent: NormalizedProperty[],
  limit: number,
  options?: PickSmartRelatedOptions,
): NormalizedProperty[] {
  const hints = options?.hints;
  const scored = poolExcludingCurrent
    .map((p) => ({ p, score: scoreCandidate(current, p, hints) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const ta = new Date(a.p.lastUpdate).getTime();
      const tb = new Date(b.p.lastUpdate).getTime();
      if (tb !== ta) return tb - ta;
      return b.p.id - a.p.id;
    });

  const seen = new Set<number>();
  const out: NormalizedProperty[] = [];
  for (const { p } of scored) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
    if (out.length >= limit) break;
  }
  return out;
}
