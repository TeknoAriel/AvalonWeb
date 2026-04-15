'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

export function CinematicHero({
  posterUrl,
  videoUrl,
}: {
  posterUrl: string | null;
  videoUrl: string | null;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.play().catch(() => {});
  }, [videoUrl]);

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden bg-premier-ink">
      <div className="absolute inset-0">
        {videoUrl ? (
          <video
            ref={ref}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={posterUrl ?? undefined}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : posterUrl ? (
          <Image
            src={posterUrl}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#070d18] via-premier-ink to-[#1a2d4d]" />
        )}
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-b from-brand-primary/45 via-[#0c1528]/40 to-brand-primary/80"
        aria-hidden
      />
      <div className="relative z-10 flex min-h-[100dvh] flex-col justify-center px-6 pb-28 pt-28 md:px-12 md:pb-36 md:pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-caps text-premier-gold">
            Avalon Premier
          </p>
          <h1 className="mt-8 font-serif text-4xl font-medium leading-[1.08] tracking-tight text-white md:text-6xl lg:text-[3.5rem]">
            Selección. Experiencia. Confianza.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-pretty text-base leading-relaxed text-premier-line/95 md:text-lg">
            Activos inmobiliarios de alto estándar con criterio patrimonial y visión internacional.
          </p>
          <p className="mx-auto mt-6 max-w-xl text-sm italic text-white/55 md:text-base">
            No vendemos propiedades. Seleccionamos activos.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link
              href="/propiedades"
              className="min-w-[220px] border border-premier-gold/70 px-8 py-4 text-center text-[11px] font-medium uppercase tracking-caps text-white transition duration-400 hover:border-premier-gold hover:bg-white/5"
            >
              Explorar propiedades
            </Link>
            <Link
              href="/contacto"
              className="min-w-[220px] bg-premier-gold px-8 py-4 text-center text-[11px] font-medium uppercase tracking-caps text-premier-ink transition duration-400 hover:brightness-110"
            >
              Hablar con un asesor
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
