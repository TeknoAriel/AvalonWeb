import {
  filterNormalizedProperties,
  propertyListFiltersHaveActiveContext,
  propertyTypeLabel,
  queryToPropertyListFilters,
  sortByFeaturedThenRecent,
} from '@avalon/core';
import type { Metadata } from 'next';
import { NaturalSearchBar, SavedSearchesToolbar } from '@avalon/ui';
import { PropertyCardPremier } from '@/components/property-card-premier';
import { PropertyFilters } from '@/components/property-filters';
import { getPropertiesFromKitepropFeed } from '@/providers/kiteprop-feed';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Colección Premier',
  description: 'Activos curados — Avalon Premier.',
};

/** Feed en cada request (evita listado vacío por caché estático desalineado con JSON/API en vivo). */
export const dynamic = 'force-dynamic';

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

  const base = sortByFeaturedThenRecent(await getPropertiesFromKitepropFeed(SITE));
  const filtered = sortByFeaturedThenRecent(filterNormalizedProperties(base, filters), {
    rotateWithinPriorityRank: !propertyListFiltersHaveActiveContext(filters),
  });
  const noPremierInventory = base.length === 0;

  const cities = Array.from(new Set(base.map((p) => p.location.city))).sort();
  const types = Array.from(new Set(base.map((p) => p.propertyType)))
    .sort()
    .map((value) => ({ value, label: propertyTypeLabel(value) }));

  return (
    <div className="animate-fade-in mx-auto max-w-6xl px-5 py-12 md:px-7 md:py-16">
      <header className="mb-8 text-center md:mb-10">
        <p className="text-[10px] font-medium uppercase tracking-caps text-brand-accent">Premier</p>
        <h1 className="mt-2 font-serif text-3xl font-medium text-brand-primary md:text-4xl">Colección</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-brand-text/60">
          Listado curado del feed operativo. Los criterios de exposición siguen el posicionamiento
          Premier: calidad de información y encaje patrimonial.
        </p>
        <p className="mt-2 text-xs text-brand-text/45">
          {filtered.length} activo{filtered.length === 1 ? '' : 's'} mostrado
          {filtered.length === 1 ? '' : 's'}
        </p>
      </header>
      <NaturalSearchBar variant="premier" cities={cities} siteKey="premier" listPath="/propiedades" />
      <SavedSearchesToolbar variant="premier" siteKey="premier" />
      <PropertyFilters cities={cities} types={types} />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
        {filtered.map((p) => (
          <PropertyCardPremier key={p.id} property={p} site={SITE} />
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="mx-auto mt-16 max-w-lg text-center text-sm leading-relaxed text-brand-text/65">
          {noPremierInventory ? (
            <>
              <p className="font-medium text-brand-primary">No hay activos en la colección Premier</p>
              <p className="mt-4 font-light text-brand-text/60">
                Cuando haya piezas disponibles en esta curación, aparecerán aquí. Mientras tanto podés
                visitar el portal principal o ajustar los criterios de búsqueda.
              </p>
            </>
          ) : (
            <p>No hay resultados con estos criterios. Probá limpiar filtros en la barra de búsqueda.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
