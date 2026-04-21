'use client';

import { cn } from '@avalon/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AVALON_HERO_IMAGES } from '@/lib/avalon-hero-images';

const ROTATION_MS = 15_000;
const FADE_MS = 3200;

type HeroAvalonProps = {
  tagline: string;
  description: string;
};

/**
 * Hero con rotación suave entre imágenes locales (ver `AVALON_HERO_IMAGES`).
 * Overlay sobrio y ligeramente cálido para legibilidad sin look “postal turística”.
 */
export function HeroAvalon(props: HeroAvalonProps) {
  const [slide, setSlide] = useState(0);
  const n = AVALON_HERO_IMAGES.length;

  useEffect(() => {
    if (n <= 1) return;
    const id = window.setInterval(() => setSlide((s) => (s + 1) % n), ROTATION_MS);
    return () => window.clearInterval(id);
  }, [n]);

  return (
    <section className="relative min-h-[82dvh] w-full overflow-hidden bg-brand-primary text-white md:min-h-[88dvh]">
      <div className="absolute inset-0">
        {n > 0 ? (
          <div className="absolute inset-0">
            {AVALON_HERO_IMAGES.map((src, i) => (
              <Image
                key={src}
                src={src}
                alt=""
                fill
                unoptimized
                className={cn(
                  'object-cover transition-opacity ease-in-out',
                  i === slide ? 'opacity-100' : 'opacity-0',
                )}
                style={{ transitionDuration: `${FADE_MS}ms` }}
                priority={i === 0}
                sizes="100vw"
              />
            ))}
          </div>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-primary via-brand-primary-mid to-brand-primary" />
        )}
      </div>
      {/* Ligero: la foto (Rosario + casas) debe leerse clara; solo sostiene legibilidad del texto */}
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,48,88,0.28)_0%,rgba(42,36,32,0.22)_45%,rgba(20,44,78,0.32)_100%)]"
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:flex-row md:items-end md:justify-between md:px-6 md:py-24">
        <div className="max-w-xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#fdf9f3]/92 [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">
            Rosario, río y zona
          </p>
          <h1 className="text-3xl font-bold leading-tight text-[#fdf9f3] [text-shadow:0_2px_20px_rgba(0,0,0,0.35)] md:text-5xl">
            {props.tagline}
          </h1>
          <p className="text-base leading-relaxed text-[#f5f0e8]/95 [text-shadow:0_1px_14px_rgba(0,0,0,0.3)] md:text-lg">
            {props.description}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/propiedades"
              className="inline-flex items-center justify-center rounded-md bg-[#fdf9f3] px-5 py-3 text-sm font-semibold text-brand-primary shadow-md transition hover:bg-[#f2ebe0]"
            >
              Ver propiedades
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center rounded-md border-2 border-[#fdf9f3]/85 bg-transparent px-5 py-3 text-sm font-semibold text-[#fdf9f3] transition hover:bg-white/10"
            >
              Asesoramiento
            </Link>
          </div>
        </div>
        <div className="w-full max-w-md rounded-xl border border-white/25 bg-[rgba(8,24,48,0.35)] p-4 shadow-lg backdrop-blur-md">
          <p className="text-sm font-semibold text-[#fdf9f3]">Buscador rápido</p>
          <p className="mt-2 text-sm leading-relaxed text-[#f0ebe2]/90">
            Venta, alquiler o temporario, con filtros por tipo y zona.
          </p>
          <Link
            href="/propiedades"
            className="mt-4 block rounded-md bg-brand-accent px-4 py-3 text-center text-sm font-bold text-brand-primary transition hover:brightness-[1.02]"
          >
            Ir al listado
          </Link>
        </div>
      </div>
    </section>
  );
}
