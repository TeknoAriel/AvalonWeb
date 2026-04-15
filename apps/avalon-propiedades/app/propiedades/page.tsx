import { filterNormalizedProperties, propertyTypeLabel, sortByFeaturedThenRecent } from '@avalon/core';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PropertyCardAvalon } from '@/components/property-card-avalon';
import { PropertyFilters } from '@/components/property-filters';
import { loadSortedSiteProperties } from '@/lib/site-property-list';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Propiedades',
  description: 'Listado de propiedades en venta y alquiler.',
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const op = typeof searchParams.op === 'string' ? searchParams.op : 'all';
  const type = typeof searchParams.type === 'string' ? searchParams.type : 'all';
  const city = typeof searchParams.city === 'string' ? searchParams.city : 'all';
  const q = typeof searchParams.q === 'string' ? searchParams.q : '';

  const base = await loadSortedSiteProperties();
  const filtered = filterNormalizedProperties(base, {
    operation: op as 'all' | 'sale' | 'rent' | 'temp',
    propertyType: type,
    city,
    q,
  });

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
