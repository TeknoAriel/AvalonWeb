import type { Metadata } from 'next';
import { PropertyCompareView } from '@avalon/ui';
import { getPropertiesFromKitepropFeed } from '@/providers/kiteprop-feed';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Comparar colección',
  description: 'Compará hasta 5 propiedades Premier.',
};

export default async function ComparePage() {
  const properties = await getPropertiesFromKitepropFeed(SITE);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <header className="mb-12 text-center">
        <p className="text-xs uppercase tracking-caps text-brand-accent">Premier</p>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-brand-primary md:text-4xl">
          Comparar propiedades
        </h1>
        <p className="mt-3 text-sm text-brand-text/65">
          Hasta 5 propiedades seleccionadas desde la colección.
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
