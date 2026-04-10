import { getSiteBrandConfig } from '@avalon/config';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Datos de contacto y matrícula profesional.',
};

export default function ContactPage() {
  const brand = getSiteBrandConfig(SITE);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:px-6">
      <h1 className="text-3xl font-bold text-brand-primary">Contacto</h1>
      <p className="mt-4 text-brand-muted">{brand.description}</p>
      <div className="mt-10 space-y-4 rounded-2xl border border-brand-primary/10 bg-white p-8 shadow-sm">
        <p>
          <span className="font-semibold text-brand-primary">{brand.contact.professionalName}</span>
          <br />
          Matrícula {brand.contact.licenseId}
        </p>
        <p>
          Teléfono:{' '}
          <a className="font-medium text-brand-primary-mid underline" href={`tel:${brand.contact.phoneTel}`}>
            {brand.contact.phoneDisplay}
          </a>
        </p>
        {brand.contact.whatsapp ? (
          <p>
            WhatsApp:{' '}
            <a
              className="font-medium text-brand-primary-mid underline"
              href={`https://wa.me/${brand.contact.whatsapp}`}
            >
              Escribinos
            </a>
          </p>
        ) : null}
        <p className="text-sm text-brand-muted">
          Formulario web: próximamente. Por ahora usá teléfono o WhatsApp para consultas inmediatas.
        </p>
      </div>
    </div>
  );
}
