import { pickHomeEditorialSelection, propertyTypeLabel, sortByFeaturedThenRecent } from '@avalon/core';
import { getSiteBrandConfig } from '@avalon/config';
import { RecentPropertiesStrip } from '@avalon/ui';
import { CinematicHero } from '@/components/cinematic-hero';
import { resolvePremierHeroPosterUrls } from '@/lib/premier-hero-posters';
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

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const brand = getSiteBrandConfig(SITE);
  const all = sortByFeaturedThenRecent(await getPropertiesFromKitepropFeed(SITE));
  const featured = pickHomeEditorialSelection(all, 6);
  const heroPosters = resolvePremierHeroPosterUrls(all, 8);
  const heroVideo = process.env.NEXT_PUBLIC_PREMIER_HERO_VIDEO_URL?.trim() || null;

  return (
    <>
      <CinematicHero posterUrls={heroPosters} videoUrl={heroVideo} />

      <BrandPositioningSection />

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-10 md:px-8 md:pb-24 md:pt-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-caps text-brand-accent/90">
            Propiedades destacadas
          </p>
          <h2 className="mt-4 font-serif text-3xl font-normal tracking-tight text-brand-primary md:text-4xl">
            Selección Premier
          </h2>
          <p className="mt-4 text-sm font-light leading-relaxed text-brand-text/62 md:text-base">
            Piezas curadas del feed operativo. Cada ficha cumple criterios de calidad, documentación y
            encaje con el posicionamiento Premier.
          </p>
        </div>
        {featured.length === 0 ? (
          <div className="mx-auto mt-10 max-w-lg border border-premier-line/50 bg-brand-surface-alt/50 p-10 text-center md:p-12">
            <p className="font-serif text-xl font-normal text-brand-primary">Colección en preparación</p>
            <p className="mt-5 text-sm font-light leading-relaxed text-brand-text/62">
              En este momento no hay piezas publicadas en la colección Premier. Podés explorar el
              catálogo completo en Avalon Web o volver más adelante.
            </p>
            <Link
              href={brand.urls.peerSite}
              className="mt-8 inline-block text-[11px] uppercase tracking-caps text-brand-accent"
            >
              {brand.urls.peerCta}
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {featured.map((p) => (
              <PropertyCardPremier key={p.id} property={p} site={SITE} />
            ))}
          </div>
        )}
        <RecentPropertiesStrip site={SITE} variant="premier" propertyPathPrefix="/propiedades" />
      </section>

      <DifferentiatorsSection />

      <PremierDestinationsSection />

      <PremierCoverVideosSection />

      <section className="border-t border-premier-line/40 bg-brand-bg py-24 md:py-28">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <h3 className="text-center font-serif text-2xl font-normal tracking-tight text-brand-primary md:text-3xl">
            Explorar por tipología
          </h3>
          <div className="mt-14 flex flex-wrap justify-center gap-3 md:gap-4">
            {Array.from(new Set(all.map((p) => p.propertyType)))
              .slice(0, 8)
              .map((t) => (
                <Link
                  key={t}
                  href={`/propiedades?type=${encodeURIComponent(t)}`}
                  className="border border-premier-line/70 px-6 py-3 text-[10px] font-medium uppercase tracking-caps text-brand-text/80 transition duration-400 hover:border-brand-accent/70 hover:text-brand-primary"
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
