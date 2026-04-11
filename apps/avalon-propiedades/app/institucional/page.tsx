import { getSiteBrandConfig } from '@avalon/config';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Quiénes somos',
  description: 'Avalon Propiedades — empresa inmobiliaria en Rosario.',
};

export default function InstitutionalPage() {
  const brand = getSiteBrandConfig(SITE);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:px-6">
      <h1 className="text-3xl font-bold text-brand-primary">Quiénes somos</h1>

      <div className="mt-8 space-y-6 text-brand-muted">
        <p>
          Somos una empresa inmobiliaria de la ciudad de Rosario con amplia trayectoria en el mercado
          local. A lo largo de los años hemos construido una reputación basada en la confianza, la
          transparencia y el conocimiento profundo del sector.
        </p>
        <p>
          Trabajamos con un enfoque moderno e innovador, incorporando nuevas estrategias comerciales,
          análisis de mercado y herramientas tecnológicas que nos permiten brindar un servicio eficiente
          y orientado a resultados.
        </p>
        <p>Nos especializamos en la comercialización de proyectos inmobiliarios de alta rentabilidad, entre ellos:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Barrios abiertos residenciales</li>
          <li>
            Barrios privados en entornos naturales, estratégicamente ubicados en zonas cercanas a
            Rosario
          </li>
          <li>Edificios de departamentos listos para habitar</li>
          <li>Fideicomisos de inversión en zonas consolidadas del micro y macrocentro</li>
          <li>
            Desarrollos de alta gama, con excelente calidad constructiva, ubicaciones privilegiadas y
            vistas al río
          </li>
        </ul>
        <p>
          Además, contamos con una sólida experiencia en compra, venta, alquiler y tasación de todo
          tipo de inmuebles.
        </p>
        <p>
          Nuestro equipo está conformado por profesionales comprometidos, preparados para asesorarte en
          cada etapa del proceso, con un objetivo claro: ayudarte a tomar decisiones seguras y concretar
          operaciones exitosas.
        </p>
      </div>

      <p className="mt-10 text-sm text-brand-muted">
        {brand.contact.professionalName} — Mat. {brand.contact.licenseId}.
      </p>

      <Link
        href={brand.urls.peerSite}
        className="mt-8 inline-block text-sm font-semibold text-brand-primary underline"
      >
        {brand.urls.peerCta}
      </Link>
    </div>
  );
}
