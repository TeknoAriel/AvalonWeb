import {
  buildMarketSummaryForCity,
  getPropertyByIdFromRaw,
  getPropertyMapEmbedSrc,
  getPropertyMapsSearchUrl,
  getRelatedPropertiesFromRaw,
  getSitePropertiesFromRaw,
  parsePropertySlugParam,
  propertyMapLocationNote,
} from '@avalon/core';
import { getSiteBrandConfig, isFeatureEnabled } from '@avalon/config';
import {
  MediaGallery,
  PriceSummary,
  PropertyAskWidget,
  PropertyConsultaForm,
  PropertyFavoriteToggle,
  PropertyViewTracker,
  RecentPropertiesStrip,
} from '@avalon/ui';
import { extractYouTubeVideoId, toYouTubeEmbedUrl } from '@avalon/utils';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PropertyCardPremier } from '@/components/property-card-premier';
import { PropertyCtaBar } from '@/components/property-cta-bar';
import { premierEditorialLead } from '@/lib/premier-editorial-lead';
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
  const siteList = getSitePropertiesFromRaw(SITE, raw);
  const market =
    isFeatureEnabled('market_summary') && property.location.city
      ? buildMarketSummaryForCity(property.location.city, siteList)
      : null;
  const bucket =
    market && market.sampleSize >= 5 ? market.bucketForProperty(property) : null;
  const brand = getSiteBrandConfig(SITE);
  const waDigits =
    property.agent.phone_whatsapp?.replace(/\D/g, '') || brand.contact.whatsapp || '';
  const telRaw = (property.agent.phone ?? brand.contact.phoneTel).replace(/\s/g, '');
  const telHref = `tel:${telRaw}`;
  const waInfo = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(`Solicito información: ${property.title}`)}`
    : telHref;
  const waVisit = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(`Deseo coordinar una visita: ${property.title}`)}`
    : '/contacto';

  const mapEmbedSrc = getPropertyMapEmbedSrc(property);
  const mapNote = propertyMapLocationNote(property);
  const mapsSearchHref = getPropertyMapsSearchUrl(property);
  const hasVideo = extractYouTubeVideoId(property.media.youtubeUrl ?? '') != null;
  const hasTour360 = Boolean(property.media.tour360Html?.trim());
  const compactMedia = !hasVideo && !hasTour360;

  return (
    <article className="pb-28 md:pb-0">
      <PropertyViewTracker site={SITE} property={property} />
      <nav className="mx-auto max-w-7xl px-6 py-8 text-[10px] uppercase tracking-caps text-brand-text/45 md:px-8">
        <Link href="/propiedades" className="transition hover:text-brand-accent">
          Colección
        </Link>
        <span className="mx-2 text-premier-line">/</span>
        <span className="text-brand-text/70">{property.title}</span>
      </nav>
      <div className="mx-auto flex max-w-7xl justify-end px-6 md:px-8">
        <PropertyFavoriteToggle site={SITE} property={property} variant="premier" />
      </div>

      <div className="border-b border-premier-line/40 bg-brand-bg">
        <div className="mx-auto max-w-7xl px-0 md:px-8 md:py-4">
          <MediaGallery media={property.media} brand="premier" layout="editorial" />
        </div>
      </div>

      {compactMedia ? (
        <div className="mx-auto max-w-3xl space-y-12 border-b border-premier-line/30 px-6 py-12 md:px-8 md:py-14">
          <section>
            <h2 className="font-serif text-xl font-normal tracking-wide text-brand-primary md:text-2xl">
              Descripción
            </h2>
            <div
              className="property-html mt-6 max-w-none text-[17px] font-light leading-[1.9] text-brand-text/78 md:text-lg md:leading-[1.92] [&_p]:mb-5 [&_ul]:list-disc [&_ul]:pl-5"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: property.descriptionHtml }}
            />
          </section>
          {property.amenities.length > 0 ? (
            <section>
              <h2 className="font-serif text-xl text-brand-primary md:text-2xl">Amenities</h2>
              <ul className="mt-6 space-y-2 text-sm text-brand-text/72">
                {property.amenities.map((a) => (
                  <li key={a.id} className="border-b border-premier-line/35 py-2.5">
                    {a.label}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}

      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-16 lg:grid-cols-[1fr_minmax(300px,380px)] lg:gap-20 lg:px-8 lg:py-20">
        <div className="min-w-0 space-y-16 md:space-y-20">
          <header className="space-y-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-brand-accent/90">
              {property.propertyTypeLabel} · {property.location.city}
            </p>
            <h1 className="font-serif text-[1.85rem] font-normal leading-[1.12] tracking-[-0.025em] text-brand-primary md:text-[2.65rem] md:leading-[1.1]">
              {property.title}
            </h1>
            <p className="max-w-2xl text-[13px] font-light leading-relaxed tracking-wide text-brand-text/50 md:text-sm">
              {property.location.address}
              {property.location.zone ? ` — ${property.location.zone}` : ''}
            </p>
          </header>

          <p className="border-l border-premier-gold/50 pl-5 font-serif text-base font-light italic leading-[1.65] text-brand-text/72 md:pl-6 md:text-lg md:leading-[1.7]">
            {premierEditorialLead(property)}
          </p>

          {!compactMedia ? (
            <section>
              <h2 className="font-serif text-lg font-normal tracking-wide text-brand-primary md:text-xl">
                Descripción
              </h2>
              <div
                className="property-html mt-7 max-w-none text-base font-light leading-[1.85] text-brand-text/72 [&_p]:mb-5 [&_ul]:list-disc [&_ul]:pl-5 md:text-[17px] md:leading-[1.88]"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: property.descriptionHtml }}
              />
            </section>
          ) : null}

          {hasVideo ? (
            <section>
              <h2 className="font-serif text-lg font-normal tracking-wide text-brand-primary md:text-xl">
                Video
              </h2>
              <div className="mt-6 aspect-video w-full max-w-3xl overflow-hidden border border-premier-line/40 bg-neutral-100">
                <iframe
                  title="Video de la propiedad"
                  src={toYouTubeEmbedUrl(property.media.youtubeUrl ?? '')}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </section>
          ) : null}

          <section className="space-y-6">
            <PropertyConsultaForm propertyId={property.id} variant="premier" />
            <PropertyAskWidget propertyId={property.id} variant="premier" siteKey="premier" />
          </section>

          {hasTour360 ? (
            <section>
              <h2 className="font-serif text-lg font-normal tracking-wide text-brand-primary md:text-xl">
                Recorrido 360
              </h2>
              <div
                className="mt-6 min-h-[320px] overflow-hidden border border-premier-line/40 bg-neutral-100"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: property.media.tour360Html ?? '' }}
              />
            </section>
          ) : null}

          {!compactMedia && property.amenities.length > 0 ? (
            <section>
              <h2 className="font-serif text-xl text-brand-primary md:text-2xl">Amenities</h2>
              <ul className="mt-6 columns-1 gap-x-10 gap-y-2 text-sm text-brand-text/70 sm:columns-2">
                {property.amenities.map((a) => (
                  <li key={a.id} className="break-inside-avoid border-b border-premier-line/40 py-2">
                    {a.label}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section>
            <h2 className="font-serif text-lg font-normal tracking-wide text-brand-primary md:text-xl">
              Ubicación
            </h2>
            {mapEmbedSrc ? (
              <>
                <iframe
                  title="Mapa de la propiedad"
                  src={mapEmbedSrc}
                  className="mt-6 aspect-video w-full max-w-3xl border border-premier-line/50"
                  loading="lazy"
                  allowFullScreen
                />
                {mapNote ? (
                  <p className="mt-3 max-w-3xl text-sm font-light text-brand-text/55">{mapNote}</p>
                ) : null}
              </>
            ) : (
              <div className="mt-6 max-w-3xl border border-dashed border-premier-line/45 bg-brand-surface-alt/25 px-4 py-12 text-center text-sm font-light text-brand-text/55">
                <p>No hay datos suficientes de dirección para mostrar el mapa en esta ficha.</p>
                {mapsSearchHref ? (
                  <a
                    href={mapsSearchHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-xs font-medium uppercase tracking-caps text-brand-accent underline-offset-4 hover:underline"
                  >
                    Abrir en Google Maps
                  </a>
                ) : null}
              </div>
            )}
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-32 border border-premier-line/45 bg-brand-surface-alt/15 p-8">
            <PriceSummary
              property={property}
              className="space-y-2 font-serif text-[1.35rem] font-normal leading-snug tracking-tight text-brand-primary md:text-[1.5rem]"
            />
            {bucket && market?.medianPricePerM2 != null ? (
              <p className="mt-7 text-[11px] font-light leading-[1.65] text-brand-text/50">
                Referencia en {property.location.city} ({market.sampleSize} avisos venta con datos): precio
                /m² mediano ~{Math.round(market.medianPricePerM2).toLocaleString('es-AR')}. Esta ficha queda
                en rango {bucket === 'low' ? 'inferior' : bucket === 'high' ? 'superior' : 'intermedio'}{' '}
                (orientativo).
              </p>
            ) : null}
            <div className="mt-9 flex flex-col gap-3">
              <a
                href={waInfo}
                className="border border-brand-primary/70 py-3.5 text-center text-[10px] font-medium uppercase tracking-caps text-brand-primary transition duration-300 hover:border-brand-primary hover:bg-brand-primary/5"
              >
                Solicitar información
              </a>
              <a
                href={waVisit}
                className="border border-premier-line/60 py-3.5 text-center text-[10px] font-medium uppercase tracking-caps text-brand-text/85 transition duration-300 hover:border-brand-accent/50 hover:text-brand-primary"
              >
                Coordinar visita
              </a>
              <a
                href={telHref}
                className="py-1.5 text-center text-[11px] font-light tracking-wide text-brand-text/55 underline-offset-4 transition hover:text-brand-primary hover:underline"
              >
                Llamar
              </a>
            </div>
            <div className="mt-10 space-y-1 border-t border-premier-line/35 pt-8 text-[12px] text-brand-text/58">
              <p className="pb-2 text-[9px] font-medium uppercase tracking-[0.18em] text-brand-text/38">
                Datos clave
              </p>
              {[
                ['Ambientes', property.rooms.totalRooms],
                ['Dormitorios', property.rooms.bedrooms],
                ['Baños', property.rooms.bathrooms],
                ['Superficie', property.surfaces.totalM2 ? `${property.surfaces.totalM2} m²` : '—'],
                ['Cocheras', property.building.parkings],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between gap-4 border-b border-premier-line/25 py-2.5 font-light"
                >
                  <span className="text-brand-text/55">{k}</span>
                  <span className="shrink-0 tabular-nums tracking-tight text-brand-primary">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-8 md:px-8">
        <RecentPropertiesStrip
          site={SITE}
          variant="premier"
          propertyPathPrefix="/propiedades"
          title="Vistos recientemente"
        />
      </div>

      {related.length > 0 ? (
        <section className="border-t border-premier-line/40 bg-brand-surface-alt/25 py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <h2 className="font-serif text-2xl font-normal tracking-tight text-brand-primary md:text-3xl">
              Otras piezas de la colección
            </h2>
            <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-brand-text/52">
              Sugerencias por afinidad de zona, tipología y orden de mercado en el catálogo actual.
            </p>
            <div className="mt-12 grid gap-12 md:grid-cols-2">
              {related.map((p) => (
                <PropertyCardPremier key={p.id} property={p} site={SITE} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <PropertyCtaBar infoHref={waInfo} visitHref={waVisit} telHref={telHref} />
    </article>
  );
}
