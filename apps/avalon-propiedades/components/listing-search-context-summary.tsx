import type { PropertyListFilters } from '@avalon/core';

import { formatListingSearchContextSummary, listingFiltersHaveContext } from '@/lib/search-context-format';

/** Resumen minimalista de la búsqueda de origen (`returnTo` ya decodificado a filtros). */
export function ListingSearchContextSummary({ filters }: { filters: PropertyListFilters | null }) {
  if (!filters || !listingFiltersHaveContext(filters)) return null;
  const text = formatListingSearchContextSummary(filters);
  if (!text) return null;

  return (
    <p className="border-l-2 border-brand-primary/25 py-1 pl-3 text-sm leading-relaxed text-brand-text/75">
      {text}
    </p>
  );
}
