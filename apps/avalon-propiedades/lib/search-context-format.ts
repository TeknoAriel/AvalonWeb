import type { PropertyListFilters } from '@avalon/core';
import { propertyTypeLabel } from '@avalon/core';
import { PORTAL_LISTING_UX_COPY } from '@avalon/config';
import { formatMoneyAmount } from '@avalon/utils';

const C = PORTAL_LISTING_UX_COPY.searchContextSummary;

function fmtUsd(n: number): string {
  const s = formatMoneyAmount(String(n), 'USD');
  return s || String(n);
}

export function listingFiltersHaveContext(f: PropertyListFilters): boolean {
  return Boolean(
    (f.operation && f.operation !== 'all') ||
      (f.propertyType && f.propertyType !== 'all') ||
      (f.city && f.city !== 'all') ||
      (f.zone && f.zone !== 'all') ||
      (f.q && f.q.trim()) ||
      (f.minSalePrice != null && Number.isFinite(f.minSalePrice)) ||
      (f.maxSalePrice != null && Number.isFinite(f.maxSalePrice)) ||
      (f.minBedrooms != null && Number.isFinite(f.minBedrooms)) ||
      (f.minBathrooms != null && Number.isFinite(f.minBathrooms)) ||
      (f.minTotalM2 != null && Number.isFinite(f.minTotalM2)) ||
      (f.maxTotalM2 != null && Number.isFinite(f.maxTotalM2)) ||
      f.hasParking === true ||
      f.fitCredit === true,
  );
}

/** Una línea legible para el resumen de búsqueda; `null` si no hay nada que mostrar. */
export function formatListingSearchContextSummary(f: PropertyListFilters): string | null {
  if (!listingFiltersHaveContext(f)) return null;

  const parts: string[] = [];

  const type =
    f.propertyType && f.propertyType !== 'all' ? propertyTypeLabel(f.propertyType) : '';
  const city = f.city && f.city !== 'all' ? f.city : '';
  if (type && city) parts.push(`${type} en ${city}`);
  else if (type) parts.push(type);
  else if (city) parts.push(`Ubicación: ${city}`);

  if (f.zone && f.zone !== 'all') parts.push(`Zona: ${f.zone}`);

  if (f.operation === 'sale') parts.push('Venta');
  else if (f.operation === 'rent') parts.push('Alquiler');
  else if (f.operation === 'temp') parts.push('Alquiler temporal');

  if (f.minBedrooms != null && Number.isFinite(f.minBedrooms)) parts.push(C.atLeastBeds(f.minBedrooms));
  if (f.minBathrooms != null && Number.isFinite(f.minBathrooms)) parts.push(C.atLeastBaths(f.minBathrooms));

  const minP = f.minSalePrice != null && Number.isFinite(f.minSalePrice) ? f.minSalePrice : null;
  const maxP = f.maxSalePrice != null && Number.isFinite(f.maxSalePrice) ? f.maxSalePrice : null;
  if (minP != null && maxP != null) {
    const a = fmtUsd(minP);
    const b = fmtUsd(maxP);
    if (a && b) parts.push(C.priceRange(a, b));
  } else if (minP != null) {
    const a = fmtUsd(minP);
    if (a) parts.push(C.priceFrom(a));
  } else if (maxP != null) {
    const a = fmtUsd(maxP);
    if (a) parts.push(C.priceTo(a));
  }

  if (f.minTotalM2 != null && Number.isFinite(f.minTotalM2)) {
    parts.push(`desde ${f.minTotalM2} m²`);
  }
  if (f.maxTotalM2 != null && Number.isFinite(f.maxTotalM2)) {
    parts.push(`hasta ${f.maxTotalM2} m²`);
  }

  if (f.hasParking === true) parts.push(C.withParking);
  if (f.fitCredit === true) parts.push(C.withCredit);
  if (f.q && f.q.trim()) parts.push(C.textQuery(f.q.trim().slice(0, 48)));

  if (parts.length === 0) return null;
  return `${C.prefix} ${parts.join(C.separator)}`;
}
