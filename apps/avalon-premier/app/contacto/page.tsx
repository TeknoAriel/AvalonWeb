import { getSiteBrandConfig } from '@avalon/config';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Consultas reservadas — Avalon Premier.',
};

export default function ContactPage() {
  const brand = getSiteBrandConfig(SITE);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center md:px-6">
      <p className="text-xs uppercase tracking-caps text-brand-accent">Premier</p>
      <h1 className="mt-4 font-serif text-4xl font-semibold text-brand-primary">Contacto</h1>
      <p className="mt-6 text-sm leading-relaxed text-brand-text/70">{brand.description}</p>
      <div className="mt-14 border border-brand-accent/20 bg-brand-surface-alt/40 p-10 text-left text-sm text-brand-text/80">
        <p className="font-serif text-lg text-brand-primary">{brand.contact.professionalName}</p>
        <p className="mt-2">Matrícula {brand.contact.licenseId}</p>
        <p className="mt-4">
          <a className="border-b border-brand-accent/40 hover:border-brand-accent" href={`tel:${brand.contact.phoneTel}`}>
            {brand.contact.phoneDisplay}
          </a>
        </p>
        {brand.contact.whatsapp ? (
          <p className="mt-4">
            <a
              className="border-b border-brand-accent/40 hover:border-brand-accent"
              href={`https://wa.me/${brand.contact.whatsapp}`}
            >
              WhatsApp
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}
