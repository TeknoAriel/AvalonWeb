import { filterNormalizedProperties, propertyTypeLabel, sortByFeaturedThenRecent } from '@avalon/core';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PropertyCardPremier } from '@/components/property-card-premier';
import { PropertyFilters } from '@/components/property-filters';
import { getPropertiesFromKitepropFeed } from '@/providers/kiteprop-feed';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Colección Premier',
  description: 'Activos curados — Avalon Premier.',
};

/** ISR: regenerar listado periódicamente cuando el feed/API cambie. */
export const revalidate = 3600;

export default function PropertiesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const op = typeof searchParams.op === 'string' ? searchParams.op : 'all';
  const type = typeof searchParams.type === 'string' ? searchParams.type : 'all';
  const city = typeof searchParams.city === 'string' ? searchParams.city : 'all';
  const q = typeof searchParams.q === 'string' ? searchParams.q : '';

  const base = sortByFeaturedThenRecent(getPropertiesFromKitepropFeed(SITE));
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
    <div className="animate-fade-in mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-24">
      <header className="mb-14 text-center">
        <p className="text-[11px] font-medium uppercase tracking-caps text-brand-accent">Premier</p>
        <h1 className="mt-4 font-serif text-4xl font-medium text-brand-primary md:text-5xl">Colección</h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-brand-text/60">
          Listado curado del feed operativo. Los criterios de exposición siguen el posicionamiento
          Premier: calidad de información y encaje patrimonial.
        </p>
        <p className="mt-4 text-xs text-brand-text/45">
          {filtered.length} activo{filtered.length === 1 ? '' : 's'} mostrado
          {filtered.length === 1 ? '' : 's'}
        </p>
        <Link
          href="/propiedades/comparar"
          className="mt-6 inline-block border-b border-brand-accent/40 pb-0.5 text-xs uppercase tracking-caps text-brand-accent hover:border-brand-accent"
        >
          Ver comparación
        </Link>
      </header>
      <PropertyFilters cities={cities} types={types} />
      <div className="mt-14 grid gap-14 md:grid-cols-2">
        {filtered.map((p) => (
          <PropertyCardPremier key={p.id} property={p} site={SITE} />
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
