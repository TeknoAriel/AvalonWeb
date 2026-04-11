import { getSiteBrandConfig } from '@avalon/config';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Consultas reservadas y atención directa — Avalon Premier.',
};

export default function ContactPage() {
  const brand = getSiteBrandConfig(SITE);
  const wa = brand.contact.whatsapp?.replace(/\D/g, '');

  return (
    <div className="animate-fade-in">
      <section className="border-b border-premier-line/50 bg-brand-surface-alt/30 py-20 md:py-28">
        <div className="mx-auto max-w-2xl px-6 text-center md:px-8">
          <p className="text-[11px] font-medium uppercase tracking-caps text-brand-accent">Premier</p>
          <h1 className="mt-5 font-serif text-4xl font-medium text-brand-primary md:text-5xl">
            Consulta reservada
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-brand-text/65 md:text-base">
            {brand.description}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-xl px-6 py-16 md:px-8 md:py-24">
        <p className="text-center text-[10px] uppercase tracking-caps text-brand-text/45">
          Canal directo
        </p>
        <div className="mt-10 space-y-8 border border-premier-line/60 bg-brand-bg p-10 md:p-12">
          <div>
            <p className="font-serif text-xl text-brand-primary">{brand.contact.professionalName}</p>
            <p className="mt-1 text-xs text-brand-text/50">Matrícula {brand.contact.licenseId}</p>
          </div>
          <div className="h-px bg-premier-line/50" />
          <a
            href={`tel:${brand.contact.phoneTel}`}
            className="block text-lg tracking-wide text-brand-primary transition hover:text-brand-accent"
          >
            {brand.contact.phoneDisplay}
          </a>
          {wa ? (
            <a
              href={`https://wa.me/${wa}`}
              className="inline-flex border border-brand-accent px-6 py-3 text-[10px] font-medium uppercase tracking-caps text-brand-primary transition hover:bg-brand-accent/10"
            >
              WhatsApp
            </a>
          ) : null}
        </div>
        <p className="mt-12 text-center text-xs leading-relaxed text-brand-text/50">
          Respondemos en horario comercial. Para mandatos sensibles podemos acordar ventanas de
          contacto dedicadas.
        </p>
        <div className="mt-14 text-center">
          <Link
            href="/propiedades"
            className="text-[10px] uppercase tracking-caps text-brand-accent underline-offset-4 hover:underline"
          >
            Volver a la colección
          </Link>
        </div>
      </section>
    </div>
  );
}
