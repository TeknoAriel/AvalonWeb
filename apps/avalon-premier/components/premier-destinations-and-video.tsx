import Image from 'next/image';
import { buildYouTubeNoCookieEmbedUrl } from '@avalon/utils';
import { parsePremierCoverVideos } from '@/lib/premier-cover-videos';

const DESTINATIONS = [
  {
    city: 'Rosario',
    lines: 'Río, centro y barrios premium',
    src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80',
  },
  {
    city: 'Córdoba',
    lines: 'Sierras y arquitectura contemporánea',
    src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=900&q=80',
  },
  {
    city: 'Buenos Aires',
    lines: 'Distritos icónicos y vistas urbanas',
    src: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80',
  },
  {
    city: 'Punta del Este',
    lines: 'Litoral atlántico y residencias exclusivas',
    src: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=900&q=80',
  },
] as const;

function parseVideoIds(): string[] {
  const raw = process.env.NEXT_PUBLIC_PREMIER_COVER_VIDEOS;
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function PremierDestinationsSection() {
  return (
    <section className="border-y border-stone-700/30 bg-gradient-to-b from-[#161e30] to-brand-primary py-24 text-stone-100 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <p className="text-center text-xs font-medium uppercase tracking-caps text-premier-gold/85">
          Presencia regional
        </p>
        <h2 className="mx-auto mt-5 max-w-2xl text-center font-serif text-3xl font-normal tracking-tight md:text-4xl">
          Propiedades de excepción en los mercados más relevantes
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm font-light leading-relaxed text-stone-300/90">
          Inspirado en portales de lujo internacional, curamos operaciones y referencias visuales que
          reflejan estándar editorial y confidencialidad en cada contacto.
        </p>
        <div className="mt-16 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {DESTINATIONS.map((d) => (
            <article
              key={d.city}
              className="group overflow-hidden border border-stone-500/15 bg-stone-950/20"
            >
              <div className="relative aspect-[4/5]">
                <Image
                  src={d.src}
                  alt=""
                  fill
                  className="object-cover opacity-92 transition duration-700 ease-out group-hover:scale-[1.02] group-hover:opacity-100"
                  sizes="(max-width:640px) 100vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="font-serif text-xl font-normal tracking-tight">{d.city}</h3>
                  <p className="mt-1.5 text-xs font-light text-stone-300/85">{d.lines}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-12 text-center text-[11px] font-light text-stone-400/80">
          Imágenes de referencia estética; el inventario publicado proviene del feed operativo de Avalon.
        </p>
      </div>
    </section>
  );
}

export function PremierCoverVideosSection() {
  const videos = parsePremierCoverVideos(process.env.NEXT_PUBLIC_PREMIER_COVER_VIDEOS);

  return (
    <section className="mx-auto max-w-6xl border-t border-premier-line/35 px-4 py-24 md:px-6 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-medium uppercase tracking-caps text-brand-accent/90">En movimiento</p>
        <h2 className="mt-5 font-serif text-3xl font-normal tracking-tight text-brand-primary md:text-4xl">
          Videos de portada
        </h2>
        <p className="mt-5 text-sm font-light leading-relaxed text-brand-text/65">
          Espacio reservado para recorridos aéreos, presentaciones de propiedades y contenido editorial.
          Configurá entradas en{' '}
          <code className="rounded bg-brand-primary/5 px-1 text-xs">NEXT_PUBLIC_PREMIER_COVER_VIDEOS</code>
          : id, <code className="rounded bg-brand-primary/5 px-1 text-xs">id@5-30</code> (segundos inicio-fin) o
          URL con <code className="rounded bg-brand-primary/5 px-1 text-xs">start</code> y{' '}
          <code className="rounded bg-brand-primary/5 px-1 text-xs">end</code>. Varias separadas por coma.
        </p>
      </div>
      <div className="mt-14 grid gap-10 md:grid-cols-2">
        {videos.length > 0
          ? videos.map((v) => {
              const src = buildYouTubeNoCookieEmbedUrl(v.videoId, {
                start: v.start,
                end: v.end,
              });
              const key = `${v.videoId}-${v.start ?? ''}-${v.end ?? ''}`;
              return (
                <div
                  key={key}
                  className="aspect-video overflow-hidden border border-premier-line/55 bg-brand-surface shadow-sm shadow-stone-900/[0.04]"
                >
                  <iframe
                    title={`Video ${v.videoId}`}
                    src={src}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              );
            })
          : [0, 1].map((i) => (
              <div
                key={i}
                className="flex aspect-video items-center justify-center border border-dashed border-premier-line/50 bg-brand-surface-alt/40 px-6 text-center text-sm font-light text-brand-text/55"
              >
                Próximamente: incorporá tus videos de portada vía variable de entorno.
              </div>
            ))}
      </div>
    </section>
  );
}
