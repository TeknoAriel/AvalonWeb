import { pickHomeEditorialSelection, propertyTypeLabel } from '@avalon/core';
import { getSiteBrandConfig } from '@avalon/config';
import { RecentPropertiesStrip } from '@avalon/ui';
import { HeroAvalon } from '@/components/hero-avalon';
import { PropertyCardAvalon } from '@/components/property-card-avalon';
import Link from 'next/link';
import { loadSortedSiteProperties } from '@/lib/site-property-list';
import { SITE } from '@/lib/site';

/** Orden editorial (rotación diaria) puede actualizarse sin redeploy completo. */
export const revalidate = 3600;

export default async function HomePage() {
  const brand = getSiteBrandConfig(SITE);
  const all = await loadSortedSiteProperties();
  const featured = pickHomeEditorialSelection(all, 9);
  const types = Array.from(new Set(all.map((p) => p.propertyType))).slice(0, 6);

  const nSale = all.filter((p) => p.operation.forSale).length;
  const nRent = all.filter((p) => p.operation.forRent).length;
  const nTemp = all.filter((p) => p.operation.forTempRental).length;
  const nCities = new Set(all.map((p) => p.location.city)).size;

  const cityCounts = new Map<string, number>();
  for (const p of all) {
    const c = p.location.city;
    cityCounts.set(c, (cityCounts.get(c) ?? 0) + 1);
  }
  const topCities = Array.from(cityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([city]) => city);

  return (
    <>
      <HeroAvalon tagline={brand.tagline} description={brand.description} />
      <section className="border-b border-brand-primary/10 bg-white py-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 md:grid-cols-4 md:gap-6 md:px-6">
          {[
            { label: 'Avisos activos', value: String(all.length) },
            { label: 'Ciudades', value: String(nCities) },
            { label: 'En venta', value: String(nSale) },
            { label: 'Alquiler y temp.', value: String(nRent + nTemp) },
          ].map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <p className="text-2xl font-bold text-brand-primary md:text-3xl">{s.value}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

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
        <RecentPropertiesStrip site={SITE} variant="avalon" propertyPathPrefix="/propiedades" />
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

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <h2 className="text-2xl font-bold text-brand-primary">Zonas con más oferta</h2>
        <p className="mt-2 max-w-xl text-sm text-brand-muted">
          Acceso rápido al listado filtrado por ciudad (según avisos vigentes).
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {topCities.map((city) => (
            <Link
              key={city}
              href={`/propiedades?city=${encodeURIComponent(city)}`}
              className="rounded-full border border-brand-primary/15 bg-white px-4 py-2 text-sm font-medium text-brand-primary shadow-sm transition hover:border-brand-primary/35"
            >
              {city}
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-brand-primary/10 bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-2xl font-bold text-brand-primary">Buscá por operación</h2>
          <p className="mt-2 max-w-2xl text-sm text-brand-muted">
            Venta, alquiler anual o temporario: el listado completo se puede filtrar en un clic.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Link
              href="/propiedades?op=sale"
              className="rounded-xl border border-brand-primary/12 bg-brand-surface px-6 py-5 shadow-sm transition hover:border-brand-primary/25"
            >
              <span className="text-lg font-bold text-brand-primary">Venta</span>
              <span className="mt-2 block text-sm text-brand-muted">{nSale} avisos</span>
            </Link>
            <Link
              href="/propiedades?op=rent"
              className="rounded-xl border border-brand-primary/12 bg-brand-surface px-6 py-5 shadow-sm transition hover:border-brand-primary/25"
            >
              <span className="text-lg font-bold text-brand-primary">Alquiler</span>
              <span className="mt-2 block text-sm text-brand-muted">{nRent} avisos</span>
            </Link>
            <Link
              href="/propiedades?op=temp"
              className="rounded-xl border border-brand-primary/12 bg-brand-surface px-6 py-5 shadow-sm transition hover:border-brand-primary/25"
            >
              <span className="text-lg font-bold text-brand-primary">Temporario</span>
              <span className="mt-2 block text-sm text-brand-muted">{nTemp} avisos</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-brand-surface py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-2xl font-bold text-brand-primary">Cómo trabajamos</h2>
          <p className="mt-2 max-w-2xl text-sm text-brand-muted">
            Mismo criterio de claridad y respaldo en cada etapa, sin ruido ni promesas vacías.
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-brand-primary/10 bg-white p-6">
              <p className="text-sm font-bold text-brand-primary-mid">1 · Consulta</p>
              <p className="mt-3 text-sm leading-relaxed text-brand-muted">
                Escuchamos objetivo, timing y presupuesto. Respondemos con opciones reales del
                mercado.
              </p>
            </div>
            <div className="rounded-xl border border-brand-primary/10 bg-white p-6">
              <p className="text-sm font-bold text-brand-primary-mid">2 · Recorrido</p>
              <p className="mt-3 text-sm leading-relaxed text-brand-muted">
                Visitas coordinadas, información verificada y comparación transparente entre
                alternativas.
              </p>
            </div>
            <div className="rounded-xl border border-brand-primary/10 bg-white p-6">
              <p className="text-sm font-bold text-brand-primary-mid">3 · Cierre</p>
              <p className="mt-3 text-sm leading-relaxed text-brand-muted">
                Acompañamiento en documentación y negociación hasta la firma, con foco en seguridad
                jurídica.
              </p>
            </div>
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
