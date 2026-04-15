import {
  getPropertyByIdFromRaw,
  getRelatedPropertiesFromRaw,
  parsePropertySlugParam,
} from '@avalon/core';
import { getSiteBrandConfig } from '@avalon/config';
import { PriceSummary, MediaGallery } from '@avalon/ui';
import { toYouTubeEmbedUrl } from '@avalon/utils';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PropertyCardAvalon } from '@/components/property-card-avalon';
import { getCachedRawProperties } from '@/lib/raw-properties';
import { SITE } from '@/lib/site';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parsePropertySlugParam(params.slug);
  if (id == null) return { title: 'Propiedad' };
  const raw = await getCachedRawProperties();
  const p = getPropertyByIdFromRaw(SITE, id, raw);
  if (!p) return { title: 'Propiedad' };
  return {
    title: p.title,
    description: p.plainDescription.slice(0, 160),
    openGraph: {
      title: p.title,
      description: p.plainDescription.slice(0, 160),
      images: p.media.images[0] ? [p.media.images[0].url] : undefined,
    },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const id = parsePropertySlugParam(params.slug);
  if (id == null) notFound();
  const raw = await getCachedRawProperties();
  const property = getPropertyByIdFromRaw(SITE, id, raw);
  if (!property) notFound();

  const related = getRelatedPropertiesFromRaw(SITE, property, raw, 3);
  const brand = getSiteBrandConfig(SITE);
  const waDigits =
    property.agent.phone_whatsapp?.replace(/\D/g, '') || brand.contact.whatsapp || '';

  const mapUrl =
    property.location.latitude != null &&
    property.location.longitude != null &&
    !property.location.hideExactLocation
      ? `https://maps.google.com/maps?q=${property.location.latitude},${property.location.longitude}&z=15&output=embed`
      : null;

  return (
    <article className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <nav className="text-sm text-brand-muted">
        <Link href="/propiedades" className="hover:text-brand-primary">
          Propiedades
        </Link>
        <span className="mx-2">/</span>
        <span className="text-brand-text">{property.title}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <MediaGallery media={property.media} brand="avalon" />
          {property.media.youtubeUrl ? (
            <div className="mt-8 aspect-video overflow-hidden rounded-xl bg-black/5">
              <iframe
                title="Video"
                src={property.media.youtubeUrl.replace('watch?v=', 'embed/')}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : null}
          {property.media.tour360Html ? (
            <div
              className="mt-8 overflow-hidden rounded-xl bg-black/5"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: property.media.tour360Html }}
            />
          ) : null}
        </div>
        <aside className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
              {property.propertyTypeLabel} · {property.location.city}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-brand-primary md:text-3xl">
              {property.title}
            </h1>
            <p className="mt-2 text-sm text-brand-muted">
              {property.location.address} — {property.location.zone}
            </p>
          </div>
          <div className="rounded-xl border border-brand-primary/10 bg-white p-4 shadow-sm">
            <PriceSummary property={property} className="text-lg font-bold text-brand-primary" />
            <div className="mt-4 flex flex-col gap-2 text-sm">
              {waDigits ? (
                <a
                  className="rounded-md bg-brand-primary py-3 text-center font-semibold text-white"
                  href={`https://wa.me/${waDigits}`}
                >
                  Consultar por WhatsApp
                </a>
              ) : null}
              <a
                className="rounded-md border border-brand-primary py-3 text-center font-semibold text-brand-primary"
                href={`tel:${(property.agent.phone ?? brand.contact.phoneTel).replace(/\s/g, '')}`}
              >
                Llamar
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-brand-surface-alt p-3">
              <p className="text-xs text-brand-muted">Ambientes</p>
              <p className="font-semibold text-brand-primary">{property.rooms.totalRooms}</p>
            </div>
            <div className="rounded-lg bg-brand-surface-alt p-3">
              <p className="text-xs text-brand-muted">Dormitorios</p>
              <p className="font-semibold text-brand-primary">{property.rooms.bedrooms}</p>
            </div>
            <div className="rounded-lg bg-brand-surface-alt p-3">
              <p className="text-xs text-brand-muted">Baños</p>
              <p className="font-semibold text-brand-primary">{property.rooms.bathrooms}</p>
            </div>
            <div className="rounded-lg bg-brand-surface-alt p-3">
              <p className="text-xs text-brand-muted">Superficie</p>
              <p className="font-semibold text-brand-primary">
                {property.surfaces.totalM2 ? `${property.surfaces.totalM2} m²` : '—'}
              </p>
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-14 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-bold text-brand-primary">Descripción</h2>
          <div
            className="property-html mt-4 max-w-none text-sm leading-relaxed text-brand-text [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: property.descriptionHtml }}
          />
        </div>
        <div>
          <h2 className="text-xl font-bold text-brand-primary">Características</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {property.amenities.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-brand-primary/10 bg-brand-surface-alt px-3 py-2 text-sm"
              >
                {a.label}
              </li>
            ))}
          </ul>
          {property.amenities.length === 0 ? (
            <p className="mt-2 text-sm text-brand-muted">
              Sin amenities estructuradas en la ficha; revisá la descripción.
            </p>
          ) : null}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold text-brand-primary">Ubicación</h2>
        {mapUrl ? (
          <iframe
            title="Mapa"
            src={mapUrl}
            className="mt-4 aspect-video w-full rounded-xl border border-brand-primary/10"
            loading="lazy"
            allowFullScreen
          />
        ) : (
          <p className="mt-4 text-sm text-brand-muted">
            {property.location.hideExactLocation
              ? 'Ubicación aproximada por privacidad. Consultá con un asesor.'
              : 'Coordenadas no disponibles.'}
          </p>
        )}
      </section>

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-brand-primary">Propiedades relacionadas</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PropertyCardAvalon key={p.id} property={p} site={SITE} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
