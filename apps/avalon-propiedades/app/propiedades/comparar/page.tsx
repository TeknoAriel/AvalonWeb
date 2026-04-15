import { getSitePropertiesFromRaw } from '@avalon/core';
import type { Metadata } from 'next';
import { PropertyCompareView } from '@avalon/ui';
import { getCachedRawProperties } from '@/lib/raw-properties';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Comparar propiedades',
  description: 'Compará hasta 5 propiedades lado a lado.',
};

export default async function ComparePage() {
  const raw = await getCachedRawProperties();
  const properties = getSitePropertiesFromRaw(SITE, raw);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-brand-primary">Comparar propiedades</h1>
        <p className="mt-2 text-sm text-brand-muted">
          Elegí hasta 5 propiedades desde el listado con el botón «Comparar».
        </p>
      </header>
      <PropertyCompareView
        properties={properties}
        site={SITE}
        variant="avalon"
        propertyPathPrefix="/propiedades"
      />
    </div>
  );
}
