import { getSiteBrandConfig } from '@avalon/config';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Experiencia',
  description: 'Criterio patrimonial y curaduría — Avalon Premier.',
};

export default function InstitutionalPage() {
  const brand = getSiteBrandConfig(SITE);

  return (
    <div className="animate-fade-in">
      <section className="mx-auto max-w-3xl px-6 py-20 md:px-8 md:py-28">
        <p className="text-[11px] font-medium uppercase tracking-caps text-brand-accent">Nosotros</p>
        <h1 className="mt-5 font-serif text-4xl font-medium leading-tight text-brand-primary md:text-5xl">
          Experiencia Premier
        </h1>
        <div className="mt-12 space-y-8 text-sm leading-[1.9] text-brand-text/70 md:text-base">
          <p>
            Avalon Premier opera como unidad de negocio enfocada en activos inmobiliarios de alto
            estándar, con alcance regional e internacional. No competimos en volumen: priorizamos
            curaduría, confidencialidad y criterio patrimonial en cada mandato.
          </p>
          <p>
            Cada operación se aborda con información verificada, tiempos acordados y un interlocutor
            senior que acompaña el proceso de principio a cierre — compra, venta, alquiler de alto
            nivel o estructuración de cartera.
          </p>
          <blockquote className="border-l-2 border-brand-accent/60 py-1 pl-6 font-serif text-lg italic text-brand-primary/90 md:text-xl">
            No vendemos propiedades. Seleccionamos activos.
          </blockquote>
          <p>
            {brand.contact.professionalName} — Mat. {brand.contact.licenseId}.
          </p>
        </div>
        <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:gap-8">
          <Link
            href="/contacto"
            className="inline-flex justify-center border border-brand-primary px-8 py-3.5 text-[10px] font-medium uppercase tracking-caps text-brand-primary transition hover:bg-brand-primary hover:text-brand-surface"
          >
            Iniciar conversación
          </Link>
          <Link
            href={brand.urls.peerSite}
            className="inline-flex justify-center text-[10px] uppercase tracking-caps text-brand-accent underline-offset-4 hover:underline"
          >
            {brand.urls.peerCta}
          </Link>
        </div>
      </section>
    </div>
  );
}
