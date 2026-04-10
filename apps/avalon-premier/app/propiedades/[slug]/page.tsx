import { getPropertyById, getRelatedProperties, parsePropertySlugParam } from '@avalon/core';
import { getSiteBrandConfig } from '@avalon/config';
import { PriceSummary, MediaGallery } from '@avalon/ui';
import { toYouTubeEmbedUrl } from '@avalon/utils';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PropertyCardPremier } from '@/components/property-card-premier';
import { SITE } from '@/lib/site';

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Metadata {
  const id = parsePropertySlugParam(params.slug);
  if (id == null) return { title: 'Propiedad' };
  const p = getPropertyById(SITE, id);
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

export default function PropertyDetailPage({ params }: Props) {
  const id = parsePropertySlugParam(params.slug);
  if (id == null) notFound();
  const property = getPropertyById(SITE, id);
  if (!property) notFound();

  const related = getRelatedProperties(SITE, property, 3);
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
    <article className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <nav className="text-xs uppercase tracking-caps text-brand-text/50">
        <Link href="/propiedades" className="hover:text-brand-accent">
          Colección
        </Link>
        <span className="mx-2">/</span>
        <span className="text-brand-text/80">{property.title}</span>
      </nav>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.25fr_0.75fr]">
        <div>
          <MediaGallery media={property.media} brand="premier" />
          {property.media.youtubeUrl ? (
            <div className="mt-10 aspect-video overflow-hidden bg-black/5">
              <iframe
                title="Video"
                src={toYouTubeEmbedUrl(property.media.youtubeUrl)}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : null}
          {property.media.tour360Html ? (
            <div
              className="mt-10 overflow-hidden bg-black/5"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: property.media.tour360Html }}
            />
          ) : null}
        </div>
        <aside className="space-y-8 lg:pt-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-caps text-brand-accent">
              {property.propertyTypeLabel} · {property.location.city}
            </p>
            <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight text-brand-primary md:text-4xl">
              {property.title}
            </h1>
            <p className="mt-3 text-sm text-brand-text/65">
              {property.location.address} — {property.location.zone}
            </p>
          </div>
          <div className="border border-brand-accent/20 bg-brand-surface-alt/50 p-6">
            <PriceSummary
              property={property}
              className="font-serif text-xl font-medium text-brand-primary"
            />
            <div className="mt-6 flex flex-col gap-3 text-xs uppercase tracking-caps">
              {waDigits ? (
                <a
                  className="border border-brand-accent py-3 text-center text-brand-primary transition hover:bg-brand-accent/10"
                  href={`https://wa.me/${waDigits}`}
                >
                  WhatsApp
                </a>
              ) : null}
              <a
                className="bg-brand-primary py-3 text-center text-brand-surface"
                href={`tel:${(property.agent.phone ?? brand.contact.phoneTel).replace(/\s/g, '')}`}
              >
                Llamada directa
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['Ambientes', property.rooms.totalRooms],
              ['Dormitorios', property.rooms.bedrooms],
              ['Baños', property.rooms.bathrooms],
              [
                'Superficie',
                property.surfaces.totalM2 ? `${property.surfaces.totalM2} m²` : '—',
              ],
            ].map(([k, v]) => (
              <div key={k} className="border-b border-brand-primary/10 py-2">
                <p className="text-[10px] uppercase tracking-caps text-brand-text/50">{k}</p>
                <p className="font-medium text-brand-primary">{v}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <section className="mt-20 grid gap-14 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl text-brand-primary">Descripción</h2>
          <div
            className="property-html mt-6 max-w-none text-sm leading-relaxed text-brand-text/80 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: property.descriptionHtml }}
          />
        </div>
        <div>
          <h2 className="font-serif text-2xl text-brand-primary">Detalles</h2>
          <ul className="mt-6 space-y-2">
            {property.amenities.map((a) => (
              <li
                key={a.id}
                className="border-b border-brand-accent/10 py-2 text-sm text-brand-text/80"
              >
                {a.label}
              </li>
            ))}
          </ul>
          {property.amenities.length === 0 ? (
            <p className="mt-4 text-sm text-brand-text/55">
              Sin listado estructurado de amenities; revisá la descripción.
            </p>
          ) : null}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="font-serif text-2xl text-brand-primary">Ubicación</h2>
        {mapUrl ? (
          <iframe
            title="Mapa"
            src={mapUrl}
            className="mt-6 aspect-video w-full border border-brand-accent/15"
            loading="lazy"
            allowFullScreen
          />
        ) : (
          <p className="mt-6 text-sm text-brand-text/60">
            {property.location.hideExactLocation
              ? 'Ubicación aproximada por privacidad.'
              : 'Coordenadas no disponibles.'}
          </p>
        )}
      </section>

      {related.length > 0 ? (
        <section className="mt-24">
          <h2 className="font-serif text-2xl text-brand-primary">Relacionadas</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            {related.map((p) => (
              <PropertyCardPremier key={p.id} property={p} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
