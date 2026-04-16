'use client';

import { cn } from '@avalon/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const CAROUSEL_INTERVAL_MS = 8000;

export function CinematicHero({
  posterUrl,
  posterUrls,
  videoUrl,
}: {
  /** Una sola imagen (compat) */
  posterUrl?: string | null;
  /** Varias imágenes → carrusel suave si no hay video */
  posterUrls?: string[] | null;
  videoUrl: string | null;
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
    const id = window.setInterval(() => setSlide((s) => (s + 1) % urls.length), CAROUSEL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [videoUrl, urls.length]);

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden bg-stone-950">
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
                  'object-cover transition-opacity duration-[1400ms] ease-in-out',
                  i === slide ? 'opacity-100' : 'opacity-0',
                )}
                priority={i === 0}
                sizes="100vw"
              />
            ))}
          </div>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-stone-900 via-premier-ink to-stone-950" />
        )}
      </div>
      {/* Lente azul / navy editorial: armoniza con bloques inferiores y mejora contraste del copy */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-brand-primary/45 via-brand-primary/22 to-brand-primary/72"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-stone-950/35 via-transparent to-stone-950/55"
        aria-hidden
      />
      <div className="relative z-10 flex min-h-[100dvh] flex-col justify-center px-6 pb-32 pt-32 md:px-12 md:pb-40 md:pt-36">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-caps text-premier-gold/90">
            Avalon Premier
          </p>
          <h1 className="mt-10 font-serif text-4xl font-normal leading-[1.06] tracking-tight text-white md:text-6xl lg:text-7xl">
            Selección. Experiencia. Confianza.
          </h1>
          <p className="mx-auto mt-10 max-w-2xl text-pretty text-base font-light leading-[1.75] text-white/88 md:text-lg md:leading-[1.8]">
            Activos inmobiliarios de alto estándar con criterio patrimonial y visión internacional.
          </p>
          <p className="mx-auto mt-8 max-w-xl text-sm font-light italic leading-relaxed text-white/52 md:text-base">
            No vendemos propiedades. Seleccionamos activos.
          </p>
          <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <Link
              href="/propiedades"
              className="min-w-[220px] border border-white/28 px-8 py-3.5 text-center text-[11px] font-medium uppercase tracking-caps text-white transition duration-400 hover:border-white/45 hover:bg-white/[0.06]"
            >
              Explorar propiedades
            </Link>
            <Link
              href="/contacto"
              className="min-w-[220px] bg-premier-gold px-8 py-3.5 text-center text-[11px] font-medium uppercase tracking-caps text-premier-ink transition duration-400 hover:bg-[#c9b088]"
            >
              Hablar con un asesor
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
