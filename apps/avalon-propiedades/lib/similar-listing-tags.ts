import {
  hasAmenity,
  parseListingSalePriceAmount,
  parseTotalM2,
  parseCoveredM2,
  pricePerM2,
} from '@avalon/core';
import { PORTAL_LISTING_UX_COPY } from '@avalon/config';
import type { NormalizedProperty } from '@avalon/types';

const T = PORTAL_LISTING_UX_COPY.similarTags;

function hasOutdoorSignal(p: NormalizedProperty): boolean {
  if (hasAmenity(p, 'uncovered')) return true;
  return p.amenities.some((a) => /patio|jardín|jardin|quincho|parrilla|terraza/i.test(a.label));
}

function isRecentListing(p: NormalizedProperty, maxDays = 21): boolean {
  const t = new Date(p.lastUpdate).getTime();
  if (!Number.isFinite(t)) return false;
  const days = (Date.now() - t) / (86_400_000);
  return days >= 0 && days <= maxDays;
}

/** Hasta 2 etiquetas comparando `candidate` con la ficha foco y el resto del set relacionado. */
export function tagsForSimilarProperty(
  candidate: NormalizedProperty,
  focus: NormalizedProperty,
  siblings: NormalizedProperty[],
): string[] {
  const tags: string[] = [];

  const pf = parseListingSalePriceAmount(focus);
  const pc = parseListingSalePriceAmount(candidate);
  if (pf != null && pc != null && pc > 0 && pc < pf * 0.97) tags.push(T.cheaper);

  const mf = parseTotalM2(focus) ?? parseCoveredM2(focus);
  const mc = parseTotalM2(candidate) ?? parseCoveredM2(candidate);
  if (mf != null && mc != null && mf > 0 && mc >= mf * 1.08) tags.push(T.largerM2);

  if (hasOutdoorSignal(candidate)) tags.push(T.outdoor);

  if (hasAmenity(candidate, 'new')) tags.push(T.newConstruction);
  else if (isRecentListing(candidate)) tags.push(T.newListing);

  const ppmF = pricePerM2(focus);
  const ppmC = pricePerM2(candidate);
  if (ppmF != null && ppmC != null && ppmC >= ppmF * 1.06) tags.push(T.betterValueM2);

  const zoneCand = `${candidate.location.zone} ${candidate.location.zoneSecondary}`.toLowerCase();
  if (
    focus.location.city === candidate.location.city &&
    focus.location.zone &&
    zoneCand.includes(focus.location.zone.toLowerCase().slice(0, Math.min(4, focus.location.zone.length)))
  ) {
    tags.push(T.sameZone);
  }

  const uniq = [...new Set(tags)];
  const priority = [
    T.cheaper,
    T.largerM2,
    T.outdoor,
    T.newConstruction,
    T.newListing,
    T.betterValueM2,
    T.sameZone,
  ];
  const ordered = priority.filter((p) => uniq.includes(p));
  return ordered.slice(0, 2);
}
