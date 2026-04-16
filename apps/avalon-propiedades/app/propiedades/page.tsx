import {
  filterNormalizedProperties,
  propertyTypeLabel,
  queryToPropertyListFilters,
  sortByFeaturedThenRecent,
} from '@avalon/core';
import type { Metadata } from 'next';
import Link from 'next/link';
import { NaturalSearchBar, SavedSearchesToolbar } from '@avalon/ui';
import { PropertyCardAvalon } from '@/components/property-card-avalon';
import { PropertyFilters } from '@/components/property-filters';
import { loadSortedSiteProperties } from '@/lib/site-property-list';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Propiedades',
  description: 'Listado de propiedades en venta y alquiler.',
};

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const sp = new URLSearchParams();
  for (const key of [
    'op',
    'type',
    'city',
    'zone',
    'q',
    'minSale',
    'maxSale',
    'beds',
    'baths',
    'minM2',
    'maxM2',
    'parking',
    'credit',
  ] as const) {
    const v = first(searchParams[key]);
    if (v) sp.set(key, v);
  }
  const filters = queryToPropertyListFilters(sp);

  const base = await loadSortedSiteProperties();
  const filtered = filterNormalizedProperties(base, filters);

  const cities = Array.from(new Set(base.map((p) => p.location.city))).sort();
  const types = Array.from(new Set(base.map((p) => p.propertyType)))
    .sort()
    .map((value) => ({ value, label: propertyTypeLabel(value) }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Propiedades</h1>
          <p className="mt-2 text-brand-muted">
            {filtered.length} resultado{filtered.length === 1 ? '' : 's'}
          </p>
        </div>
        <Link
          href="/propiedades/comparar"
          className="inline-flex w-fit items-center rounded-md border border-brand-primary/25 px-4 py-2 text-sm font-semibold text-brand-primary hover:border-brand-primary/50"
        >
          Ver comparación
        </Link>
      </header>
      <NaturalSearchBar variant="avalon" cities={cities} siteKey="avalon" listPath="/propiedades" />
      <SavedSearchesToolbar variant="avalon" siteKey="avalon" />
      <PropertyFilters cities={cities} types={types} />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <PropertyCardAvalon key={p.id} property={p} site={SITE} />
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-brand-muted">No hay propiedades con esos filtros.</p>
      ) : null}
    </div>
  );
}
