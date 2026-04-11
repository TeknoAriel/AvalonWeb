import { getSiteProperties, propertyTypeLabel, sortByFeaturedThenRecent } from '@avalon/core';
import { getSiteBrandConfig } from '@avalon/config';
import { HeroAvalon, pickHeroImage } from '@/components/hero-avalon';
import { PropertyCardAvalon } from '@/components/property-card-avalon';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export default function HomePage() {
  const brand = getSiteBrandConfig(SITE);
  const all = sortByFeaturedThenRecent(getSiteProperties(SITE));
  const featured = all.slice(0, 6);
  const heroImage = pickHeroImage();

  const types = Array.from(new Set(all.map((p) => p.propertyType))).slice(0, 6);

  return (
    <>
      <HeroAvalon featuredImageUrl={heroImage} />
      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-brand-primary md:text-3xl">Destacadas</h2>
            <p className="mt-2 max-w-xl text-brand-muted">
              Operaciones activas con información clara y fotos de calidad.
            </p>
          </div>
          <Link
            href="/propiedades"
            className="text-sm font-semibold text-brand-primary-mid underline"
          >
            Ver catálogo completo
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <PropertyCardAvalon key={p.id} property={p} site={SITE} />
          ))}
        </div>
      </section>

      <section className="bg-brand-surface-alt py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-2xl font-bold text-brand-primary">Por tipo de propiedad</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {types.map((t) => (
              <Link
                key={t}
                href={`/propiedades?type=${encodeURIComponent(t)}`}
                className="rounded-xl border border-brand-primary/10 bg-white px-5 py-4 text-sm font-semibold text-brand-primary shadow-sm hover:border-brand-primary/30"
              >
                {propertyTypeLabel(t)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-brand-primary">Confianza y respaldo</h2>
            <ul className="mt-6 space-y-3 text-brand-muted">
              <li>• Asesoramiento profesional en compra, venta e inversión.</li>
              <li>• Información veraz y actualizada sobre cada operación.</li>
              <li>• {brand.contact.professionalName} — Mat. {brand.contact.licenseId}</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-brand-primary/10 bg-brand-surface p-8">
            <h3 className="text-lg font-semibold text-brand-primary">Colección Premier</h3>
            <p className="mt-2 text-sm text-brand-muted">
              Conocé nuestra selección exclusiva de propiedades premium bajo la marca Avalon
              Premier.
            </p>
            <Link
              href={brand.urls.peerSite}
              className="mt-6 inline-flex rounded-md bg-brand-primary px-5 py-3 text-sm font-semibold text-white"
            >
              {brand.urls.peerCta}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
