import { getSiteProperties, propertyTypeLabel, sortByFeaturedThenRecent } from '@avalon/core';
import { getSiteBrandConfig } from '@avalon/config';
import { HeroPremier, pickHeroImage } from '@/components/hero-premier';
import { PropertyCardPremier } from '@/components/property-card-premier';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export default function HomePage() {
  const brand = getSiteBrandConfig(SITE);
  const all = sortByFeaturedThenRecent(getSiteProperties(SITE));
  const featured = all.slice(0, 4);
  const heroImage = pickHeroImage();

  return (
    <>
      <HeroPremier featuredImageUrl={heroImage} />

      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-caps text-brand-accent">Curaduría</p>
          <h2 className="mt-4 font-serif text-3xl font-semibold text-brand-primary md:text-4xl">
            Propiedades seleccionadas
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-brand-text/75">
            Cada operación es evaluada con criterios de ubicación, calidad constructiva y
            potencial de valor. Sin ruido: solo piezas que merecen atención.
          </p>
        </div>
        {featured.length === 0 ? (
          <div className="mx-auto mt-16 max-w-lg rounded border border-brand-accent/20 bg-brand-surface-alt/40 p-10 text-center">
            <p className="font-serif text-xl text-brand-primary">Colección en preparación</p>
            <p className="mt-3 text-sm text-brand-text/70">
              Aún no hay propiedades con etiqueta Premier en el feed de datos. Cuando el CRM
              asigne el tag, aparecerán aquí automáticamente. Podés usar{' '}
              <code className="rounded bg-black/5 px-1">PREMIER_PROPERTY_IDS</code> en entorno
              para pruebas.
            </p>
            <Link
              href={brand.urls.peerSite}
              className="mt-6 inline-block text-sm uppercase tracking-caps text-brand-accent"
            >
              {brand.urls.peerCta}
            </Link>
          </div>
        ) : (
          <div className="mt-16 grid gap-10 md:grid-cols-2">
            {featured.map((p) => (
              <PropertyCardPremier key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-brand-accent/10 bg-brand-surface-alt/40 py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="max-w-md">
            <h3 className="font-serif text-2xl font-semibold text-brand-primary">Estilo de vida</h3>
            <p className="mt-4 text-sm leading-relaxed text-brand-text/75">
              Avalon Premier acompaña procesos discretos de compra y venta, con foco en
              asesoramiento personalizado y confidencialidad.
            </p>
          </div>
          <Link
            href="/contacto"
            className="inline-flex w-fit border border-brand-primary px-10 py-4 text-xs font-medium uppercase tracking-caps text-brand-primary"
          >
            Solicitar entrevista
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <h3 className="text-center font-serif text-2xl text-brand-primary">Explorar por tipo</h3>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {Array.from(new Set(all.map((p) => p.propertyType)))
            .slice(0, 6)
            .map((t) => (
              <Link
                key={t}
                href={`/propiedades?type=${encodeURIComponent(t)}`}
                className="border border-brand-accent/25 px-6 py-3 text-xs uppercase tracking-caps text-brand-text hover:border-brand-accent"
              >
                {propertyTypeLabel(t)}
              </Link>
            ))}
        </div>
        <p className="mt-12 text-center text-sm text-brand-text/60">
          ¿Buscás el catálogo completo?{' '}
          <Link href={brand.urls.peerSite} className="text-brand-accent underline">
            {brand.urls.peerCta}
          </Link>
        </p>
      </section>
    </>
  );
}
