import { getSiteBrandConfig } from '@avalon/config';
import { getSiteProperties, sortByFeaturedThenRecent } from '@avalon/core';
import Image from 'next/image';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export function HeroPremier(props: { featuredImageUrl: string | null }) {
  const brand = getSiteBrandConfig(SITE);

  return (
    <section className="relative min-h-[78vh] overflow-hidden bg-brand-primary text-brand-surface">
      {props.featuredImageUrl ? (
        <Image
          src={props.featuredImageUrl}
          alt=""
          fill
          className="object-cover opacity-35"
          priority
          sizes="100vw"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/20 via-transparent to-brand-primary/90" />
      <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-4 pb-20 pt-28 md:px-6 md:pb-28">
        <p className="text-xs font-medium uppercase tracking-caps text-brand-accent-soft">
          Avalon Premier
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-[1.1] md:text-6xl">
          {brand.tagline}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-brand-surface/85 md:text-lg">
          {brand.description}
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/propiedades"
            className="inline-flex border border-brand-accent/60 px-8 py-3 text-sm font-medium tracking-wide text-brand-surface transition hover:bg-brand-surface/10"
          >
            Ver colección
          </Link>
          <Link
            href="/contacto"
            className="inline-flex bg-brand-accent px-8 py-3 text-sm font-medium tracking-wide text-brand-primary"
          >
            Consulta reservada
          </Link>
        </div>
      </div>
    </section>
  );
}

export function pickHeroImage() {
  const list = sortByFeaturedThenRecent(getSiteProperties(SITE));
  return list[0]?.media.images[0]?.url ?? null;
}
