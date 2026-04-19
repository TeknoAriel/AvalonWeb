import type { Metadata } from 'next';
import { PropertyCompareView } from '@avalon/ui';
import { getPropertiesFromKitepropFeed } from '@/providers/kiteprop-feed';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Comparar selección',
  description: 'Hasta cinco propiedades de la colección Premier, en paralelo.',
};

export default async function ComparePage() {
  const properties = await getPropertiesFromKitepropFeed(SITE);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
      <header className="mb-14 text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-brand-accent/90">Premier</p>
        <h1 className="mt-4 font-serif text-3xl font-normal tracking-tight text-brand-primary md:text-4xl">
          Comparar en la colección
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm font-light leading-relaxed text-brand-text/55">
          Elegí hasta cinco avisos desde las fichas; la vista respeta el mismo criterio de listado Premier.
        </p>
      </header>
      <PropertyCompareView
        properties={properties}
        site={SITE}
        variant="premier"
        propertyPathPrefix="/propiedades"
      />
    </div>
  );
}
