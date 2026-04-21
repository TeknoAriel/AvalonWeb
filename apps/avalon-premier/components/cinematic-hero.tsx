'use client';

import { cn } from '@avalon/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/** Rotación lenta: una imagen a la vez, sin sensación de carrusel agresivo. */
const HERO_ROTATION_MS = 16_000;
const FADE_MS = 3200;

export function CinematicHero({
  posterUrl,
  posterUrls,
  videoUrl = null,
}: {
  /** Una sola imagen (compat) */
  posterUrl?: string | null;
  /** Varias imágenes → crossfade suave si no hay video */
  posterUrls?: string[] | null;
  /** Si no se pasa, solo imágenes (home Premier curado). */
  videoUrl?: string | null;
}) {
  const urls = (() => {
    if (posterUrls?.length) return posterUrls;
    if (posterUrl) return [posterUrl];
    return [];
  })();
  const [slide, setSlide] = useState(0);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.play().catch(() => {});
  }, [videoUrl]);

  useEffect(() => {
    if (videoUrl || urls.length <= 1) return;
    const id = window.setInterval(() => setSlide((s) => (s + 1) % urls.length), HERO_ROTATION_MS);
    return () => window.clearInterval(id);
  }, [videoUrl, urls.length]);

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden bg-[#050a12]">
      <div className="absolute inset-0">
        {videoUrl ? (
          <video
            ref={ref}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={urls[0] ?? undefined}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : urls.length > 0 ? (
          <div className="absolute inset-0">
            {urls.map((src, i) => (
              <Image
                key={`${src}-${i}`}
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
          <div className="h-full w-full bg-gradient-to-br from-[#0a1524] via-[#060d18] to-[#03060c]" />
        )}
      </div>
      <div className="relative z-10 flex min-h-[100dvh] flex-col justify-center px-6 pb-32 pt-36 md:px-14 md:pb-44 md:pt-40">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-block rounded-sm bg-[#0a1628] px-4 py-2.5 text-[10px] font-medium uppercase tracking-caps text-[#f7f4ec] shadow-md md:px-5 md:text-[11px]">
            Avalon Premier
          </p>
          <h1 className="mt-8 font-serif text-[2rem] font-normal leading-[1.08] tracking-[-0.02em] text-[#f7f4ec] md:mt-10 md:text-5xl lg:text-[3.35rem] lg:leading-[1.06] [text-shadow:0_2px_28px_rgba(0,0,0,0.55)]">
            Propiedades de categoría superior
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-pretty text-[15px] font-light leading-[1.75] text-[#f7f4ec] md:mt-9 md:text-lg md:leading-[1.78] [text-shadow:0_1px_20px_rgba(0,0,0,0.5)]">
            Selección discreta y acompañamiento cercano. Propiedades seleccionadas con criterio.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:mt-14 sm:flex-row sm:gap-4">
            <Link
              href="/propiedades"
              className="min-w-[200px] bg-[#f4f1ea] px-8 py-3 text-center text-[10px] font-semibold uppercase tracking-caps text-[#0a1628] shadow-md transition duration-300 hover:bg-[#ebe6dc] md:min-w-[220px] md:py-3.5 md:text-[11px]"
            >
              Ver colección
            </Link>
            <Link
              href="/contacto"
              className="min-w-[200px] border-2 border-white bg-[#0a1628] px-8 py-3 text-center text-[10px] font-semibold uppercase tracking-caps text-white shadow-md transition duration-300 hover:bg-[#0d1f36] md:min-w-[220px] md:py-3.5 md:text-[11px]"
            >
              Consultar disponibilidad
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
