import { getSiteBrandConfig } from '@avalon/config';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Nosotros',
  description: 'Información institucional.',
};

export default function InstitutionalPage() {
  const brand = getSiteBrandConfig(SITE);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:px-6">
      <h1 className="text-3xl font-bold text-brand-primary">Nosotros</h1>
      <p className="mt-6 text-lg text-brand-muted">{brand.tagline}</p>
      <div className="mt-8 space-y-4 text-brand-muted">
        <p>
          {brand.name} es una inmobiliaria orientada a brindar información clara, respaldo
          profesional y acompañamiento en cada etapa de compra, venta o alquiler.
        </p>
        <p>
          Responsable: {brand.contact.professionalName} — Mat. {brand.contact.licenseId}.
        </p>
      </div>
      <Link
        href={brand.urls.peerSite}
        className="mt-10 inline-block text-sm font-semibold text-brand-primary underline"
      >
        {brand.urls.peerCta}
      </Link>
    </div>
  );
}
