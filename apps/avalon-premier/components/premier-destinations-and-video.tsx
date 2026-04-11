import Image from 'next/image';

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
    <section className="border-y border-brand-accent/10 bg-brand-primary py-20 text-brand-surface">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <p className="text-center text-xs font-medium uppercase tracking-caps text-brand-accent-soft">
          Presencia regional
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-center font-serif text-3xl font-semibold md:text-4xl">
          Propiedades de excepción en los mercados más relevantes
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-center text-sm leading-relaxed text-brand-surface/75">
          Inspirado en portales de lujo internacional, curamos operaciones y referencias visuales que
          reflejan estándar editorial y confidencialidad en cada contacto.
        </p>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DESTINATIONS.map((d) => (
            <article
              key={d.city}
              className="group overflow-hidden border border-brand-surface/10 bg-brand-primary/40"
            >
              <div className="relative aspect-[4/5]">
                <Image
                  src={d.src}
                  alt=""
                  fill
                  className="object-cover opacity-90 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-100"
                  sizes="(max-width:640px) 100vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-primary via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-serif text-xl font-semibold">{d.city}</h3>
                  <p className="mt-1 text-xs text-brand-surface/80">{d.lines}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-10 text-center text-[11px] text-brand-surface/50">
          Imágenes de referencia estética; el inventario publicado proviene del feed operativo de Avalon.
        </p>
      </div>
    </section>
  );
}

export function PremierCoverVideosSection() {
  const ids = parseVideoIds();

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-medium uppercase tracking-caps text-brand-accent">En movimiento</p>
        <h2 className="mt-4 font-serif text-3xl font-semibold text-brand-primary md:text-4xl">
          Videos de portada
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-brand-text/70">
          Espacio reservado para recorridos aéreos, presentaciones de propiedades y contenido editorial.
          Configurá IDs de YouTube (separados por coma) en{' '}
          <code className="rounded bg-black/5 px-1 text-xs">NEXT_PUBLIC_PREMIER_COVER_VIDEOS</code>.
        </p>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {ids.length > 0
          ? ids.map((id) => (
              <div
                key={id}
                className="aspect-video overflow-hidden border border-brand-accent/15 bg-black/5 shadow-sm"
              >
                <iframe
                  title={`Video ${id}`}
                  src={`https://www.youtube-nocookie.com/embed/${id}`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ))
          : [0, 1].map((i) => (
              <div
                key={i}
                className="flex aspect-video items-center justify-center border border-dashed border-brand-accent/25 bg-brand-surface-alt/30 px-6 text-center text-sm text-brand-text/55"
              >
                Próximamente: incorporá tus videos de portada vía variable de entorno.
              </div>
            ))}
      </div>
    </section>
  );
}
