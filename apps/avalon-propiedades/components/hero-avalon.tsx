'use client';

import { cn } from '@avalon/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AVALON_HERO_IMAGES } from '@/lib/avalon-hero-images';

const ROTATION_MS = 14_000;
const FADE_MS = 2800;

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
    <section className="relative min-h-[78dvh] w-full overflow-hidden bg-brand-primary text-white md:min-h-[82dvh]">
      <div className="absolute inset-0">
        {n > 0 ? (
          <div className="absolute inset-0">
            {AVALON_HERO_IMAGES.map((src, i) => (
              <Image
                key={src}
                src={src}
                alt=""
                fill
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
      {/* Overlay sobrio: azul de marca + leve calidez, ~55–62 % para contraste del texto */}
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,36,58,0.62)_0%,rgba(36,32,30,0.52)_48%,rgba(18,32,52,0.66)_100%)]"
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:flex-row md:items-end md:justify-between md:px-6 md:py-24">
        <div className="max-w-xl space-y-4 drop-shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/88">
            Inmobiliaria en Rosario y zona
          </p>
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">{props.tagline}</h1>
          <p className="text-base text-white/92 md:text-lg md:leading-relaxed">{props.description}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/propiedades"
              className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-brand-primary shadow-md transition hover:bg-white/95"
            >
              Ver propiedades
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center rounded-md border border-white/70 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
            >
              Asesoramiento
            </Link>
          </div>
        </div>
        <div className="w-full max-w-md rounded-xl border border-white/20 bg-white/[0.12] p-4 shadow-lg backdrop-blur-md">
          <p className="text-sm font-semibold text-white/95">Buscador rápido</p>
          <p className="mt-2 text-sm leading-relaxed text-white/85">
            Operaciones en venta, alquiler o temporario, con filtros por tipo y zona.
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
