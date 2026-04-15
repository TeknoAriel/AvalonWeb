import { getSiteBrandConfig } from '@avalon/config';
import type { NormalizedProperty } from '@avalon/types';
import Image from 'next/image';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export function HeroAvalon(props: { featuredImageUrl: string | null }) {
  const brand = getSiteBrandConfig(SITE);

  return (
    <section className="relative overflow-hidden bg-brand-primary text-white">
      {props.featuredImageUrl ? (
        <Image
          src={props.featuredImageUrl}
          alt=""
          fill
          className="object-cover opacity-40"
          priority
          sizes="100vw"
        />
      ) : null}
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 md:flex-row md:items-end md:justify-between md:px-6 md:py-24">
        <div className="max-w-xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
            Inmobiliaria en Rosario
          </p>
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">{brand.tagline}</h1>
          <p className="text-base text-white/90 md:text-lg">{brand.description}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/propiedades"
              className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-brand-primary shadow"
            >
              Ver propiedades
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center rounded-md border border-white/60 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Asesoramiento
            </Link>
          </div>
        </div>
        <div className="w-full max-w-md rounded-xl bg-white/10 p-4 backdrop-blur">
          <p className="text-sm font-semibold text-white/90">Buscador rápido</p>
          <p className="mt-2 text-sm text-white/80">
            Encontrá operaciones en venta, alquiler o temporario con filtros por tipo y zona.
          </p>
          <Link
            href="/propiedades"
            className="mt-4 block rounded-md bg-brand-accent px-4 py-3 text-center text-sm font-bold text-brand-primary"
          >
            Ir al listado
          </Link>
        </div>
      </div>
    </section>
  );
}

export function pickHeroImageFromList(list: NormalizedProperty[]) {
  return list[0]?.media.images[0]?.url ?? null;
}
