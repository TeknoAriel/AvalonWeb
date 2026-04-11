import { propertyTypeLabel, sortByFeaturedThenRecent } from '@avalon/core';
import { getSiteBrandConfig } from '@avalon/config';
import { pickHeroImage } from '@/components/hero-premier';
import { CinematicHero } from '@/components/cinematic-hero';
import {
  PremierCoverVideosSection,
  PremierDestinationsSection,
} from '@/components/premier-destinations-and-video';
import { PropertyCardPremier } from '@/components/property-card-premier';
import { BrandPositioningSection } from '@/modules/home/brand-positioning';
import { DifferentiatorsSection } from '@/modules/home/differentiators';
import { FinalCtaSection } from '@/modules/home/final-cta';
import { getPropertiesFromKitepropFeed } from '@/providers/kiteprop-feed';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export default function HomePage() {
  const brand = getSiteBrandConfig(SITE);
  const all = sortByFeaturedThenRecent(getPropertiesFromKitepropFeed(SITE));
  const featured = all.slice(0, 4);
  const poster = pickHeroImage();
  const heroVideo = process.env.NEXT_PUBLIC_PREMIER_HERO_VIDEO_URL?.trim() || null;

  return (
    <>
      <CinematicHero posterUrl={poster} videoUrl={heroVideo} />

      <BrandPositioningSection />

      <section className="mx-auto max-w-6xl px-6 py-24 md:px-8 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-caps text-brand-accent">
            Propiedades destacadas
          </p>
          <h2 className="mt-5 font-serif text-3xl font-medium text-brand-primary md:text-4xl">
            Selección actual
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-brand-text/65 md:text-base">
            Piezas curadas del feed operativo. Cada ficha cumple criterios de calidad, documentación y
            encaje con el posicionamiento Premier.
          </p>
        </div>
        {featured.length === 0 ? (
          <div className="mx-auto mt-16 max-w-lg border border-premier-line/60 bg-brand-surface-alt/30 p-12 text-center">
            <p className="font-serif text-xl text-brand-primary">Colección en preparación</p>
            <p className="mt-4 text-sm text-brand-text/65">
              Aún no hay activos con etiqueta Premier en el feed. Cuando el CRM asigne el tag,
              aparecerán automáticamente. Podés usar{' '}
              <code className="rounded bg-black/5 px-1 text-xs">PREMIER_PROPERTY_IDS</code> en entorno
              para pruebas.
            </p>
            <Link
              href={brand.urls.peerSite}
              className="mt-8 inline-block text-[11px] uppercase tracking-caps text-brand-accent"
            >
              {brand.urls.peerCta}
            </Link>
          </div>
        ) : (
          <div className="mt-16 grid gap-12 md:grid-cols-2">
            {featured.map((p) => (
              <PropertyCardPremier key={p.id} property={p} site={SITE} />
            ))}
          </div>
        )}
      </section>

      <DifferentiatorsSection />

      <PremierDestinationsSection />

      <PremierCoverVideosSection />

      <section className="border-t border-premier-line/40 bg-brand-bg py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <h3 className="text-center font-serif text-2xl text-brand-primary md:text-3xl">
            Explorar por tipología
          </h3>
          <div className="mt-12 flex flex-wrap justify-center gap-3 md:gap-4">
            {Array.from(new Set(all.map((p) => p.propertyType)))
              .slice(0, 8)
              .map((t) => (
                <Link
                  key={t}
                  href={`/propiedades?type=${encodeURIComponent(t)}`}
                  className="border border-premier-line/80 px-6 py-3 text-[10px] uppercase tracking-caps text-brand-text transition duration-400 hover:border-brand-accent hover:text-brand-primary"
                >
                  {propertyTypeLabel(t)}
                </Link>
              ))}
          </div>
          <p className="mt-14 text-center text-sm text-brand-text/55">
            Catálogo institucional:{' '}
            <Link href={brand.urls.peerSite} className="border-b border-brand-accent/40 text-brand-accent">
              {brand.urls.peerCta}
            </Link>
          </p>
        </div>
      </section>

      <FinalCtaSection />
    </>
  );
}
