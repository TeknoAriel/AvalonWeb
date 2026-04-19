import type { PropertyListFilters } from '@avalon/core';
import { parseListingSalePriceAmount, parseTotalM2, parseCoveredM2 } from '@avalon/core';
import { PORTAL_LISTING_UX_COPY } from '@avalon/config';
import type { NormalizedProperty } from '@avalon/types';

const V = PORTAL_LISTING_UX_COPY.fitInsightVariants;

/** Una o dos líneas útiles, sin scoring numérico. */
export function buildListingFitInsightLines(
  property: NormalizedProperty,
  f: PropertyListFilters,
): string[] {
  const lines: string[] = [];
  let score = 0;

  const cityOk = Boolean(f.city && f.city !== 'all' && property.location.city === f.city);
  if (cityOk) score += 1;

  const zoneOk = Boolean(
    f.zone &&
      f.zone !== 'all' &&
      (property.location.zone.toLowerCase().includes(f.zone.toLowerCase()) ||
        property.location.zoneSecondary.toLowerCase().includes(f.zone.toLowerCase())),
  );
  if (zoneOk) score += 1;

  const typeOk = Boolean(
    f.propertyType && f.propertyType !== 'all' && property.propertyType === f.propertyType,
  );
  if (typeOk) score += 1;

  const sale = parseListingSalePriceAmount(property);
  if (
    sale != null &&
    f.minSalePrice != null &&
    f.maxSalePrice != null &&
    Number.isFinite(f.minSalePrice) &&
    Number.isFinite(f.maxSalePrice) &&
    sale >= f.minSalePrice &&
    sale <= f.maxSalePrice
  ) {
    score += 1;
  }

  if (f.minBedrooms != null && Number.isFinite(f.minBedrooms) && property.rooms.bedrooms >= f.minBedrooms) {
    score += 1;
  }

  const m2 = parseTotalM2(property) ?? parseCoveredM2(property);
  if (m2 != null && f.minTotalM2 != null && Number.isFinite(f.minTotalM2) && m2 >= f.minTotalM2) {
    score += 1;
  }

  if (score >= 3) lines.push(V.multiMatch);
  if (zoneOk && lines.length < 2) lines.push(V.zoneStrong);
  if (
    sale != null &&
    f.minSalePrice != null &&
    f.maxSalePrice != null &&
    Number.isFinite(f.minSalePrice) &&
    Number.isFinite(f.maxSalePrice) &&
    sale >= f.minSalePrice &&
    sale <= f.maxSalePrice &&
    lines.length < 2
  ) {
    lines.push(V.priceBand);
  }
  if (typeOk && m2 != null && f.minTotalM2 != null && lines.length < 2) {
    lines.push(V.typeAndSize);
  }
  if (
    f.minBedrooms != null &&
    Number.isFinite(f.minBedrooms) &&
    property.rooms.bedrooms >= f.minBedrooms &&
    lines.length < 2
  ) {
    lines.push(V.bedsOk);
  }
  if (lines.length === 0) lines.push(V.defaultHint);
  return [...new Set(lines)].slice(0, 2);
}
