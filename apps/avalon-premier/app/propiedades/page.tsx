import {
  filterNormalizedProperties,
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
  const filtered = filterNormalizedProperties(base, filters);
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
              <p className="mt-3">
                El listado solo incluye avisos del feed marcados como Premier (tags, labels, flags o IDs en{' '}
                <code className="rounded bg-brand-primary/5 px-1 text-xs">PREMIER_PROPERTY_IDS</code>). No hay
                Elasticsearch: es filtrado en servidor sobre la API KiteProp (y snapshot si la API no está disponible).
              </p>
              <p className="mt-3 text-xs text-brand-text/50">
                El catálogo sale de la API KiteProp con <code className="rounded bg-brand-primary/5 px-0.5">KITEPROP_API_KEY</code>; si falla, del snapshot del repo. Podés forzar IDs con{' '}
                <code className="rounded bg-brand-primary/5 px-0.5">PREMIER_PROPERTY_IDS</code>.
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
