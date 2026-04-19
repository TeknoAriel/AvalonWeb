import type { PropertyListFilters } from '@avalon/core';
import type { NormalizedProperty } from '@avalon/types';

import { buildListingFitInsightLines } from '@/lib/listing-fit-messages';
import { listingFiltersHaveContext } from '@/lib/search-context-format';

export function ListingFitInsight({
  property,
  filters,
}: {
  property: NormalizedProperty;
  filters: PropertyListFilters | null;
}) {
  if (!filters || !listingFiltersHaveContext(filters)) return null;
  const lines = buildListingFitInsightLines(property, filters);
  if (lines.length === 0) return null;

  return (
    <div className="space-y-1.5 rounded-lg bg-brand-surface-alt/60 px-3 py-3 text-sm leading-relaxed text-brand-text/72 md:px-4">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}
