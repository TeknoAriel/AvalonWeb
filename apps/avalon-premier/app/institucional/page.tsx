import { getSiteBrandConfig } from '@avalon/config';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Experiencia',
  description: 'Sobre Avalon Premier.',
};

export default function InstitutionalPage() {
  const brand = getSiteBrandConfig(SITE);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 md:px-6">
      <p className="text-xs uppercase tracking-caps text-brand-accent">Nosotros</p>
      <h1 className="mt-4 font-serif text-4xl font-semibold text-brand-primary">Experiencia Premier</h1>
      <div className="mt-10 space-y-6 text-sm leading-relaxed text-brand-text/75">
        <p>
          Avalon Premier concentra operaciones de alto estándar, con un enfoque discreto y
          personalizado. Trabajamos con información precisa, tiempos acordados y un criterio
          estético y patrimonial exigente.
        </p>
        <p>
          {brand.contact.professionalName} — Mat. {brand.contact.licenseId}.
        </p>
      </div>
      <Link
        href={brand.urls.peerSite}
        className="mt-12 inline-block text-xs uppercase tracking-caps text-brand-accent"
      >
        {brand.urls.peerCta}
      </Link>
    </div>
  );
}
