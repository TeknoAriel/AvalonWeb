import {
  filterNormalizedProperties,
  getSiteProperties,
  propertyTypeLabel,
  sortByFeaturedThenRecent,
} from '@avalon/core';
import type { Metadata } from 'next';
import { PropertyCardPremier } from '@/components/property-card-premier';
import { PropertyFilters } from '@/components/property-filters';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Colección Premier',
  description: 'Selección exclusiva de propiedades.',
};

export default function PropertiesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const op = typeof searchParams.op === 'string' ? searchParams.op : 'all';
  const type = typeof searchParams.type === 'string' ? searchParams.type : 'all';
  const city = typeof searchParams.city === 'string' ? searchParams.city : 'all';
  const q = typeof searchParams.q === 'string' ? searchParams.q : '';

  const base = sortByFeaturedThenRecent(getSiteProperties(SITE));
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
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <header className="mb-12 text-center">
        <p className="text-xs uppercase tracking-caps text-brand-accent">Premier</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-brand-primary">Colección</h1>
        <p className="mt-3 text-sm text-brand-text/65">
          {filtered.length} propiedad{filtered.length === 1 ? '' : 'es'}
        </p>
      </header>
      <PropertyFilters cities={cities} types={types} />
      <div className="mt-12 grid gap-12 md:grid-cols-2">
        {filtered.map((p) => (
          <PropertyCardPremier key={p.id} property={p} />
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="mt-20 text-center text-sm text-brand-text/60">
          No hay resultados con estos criterios.
        </p>
      ) : null}
    </div>
  );
}
