import {
  getPropertyByIdFromRaw,
  getRelatedPropertiesFromRaw,
  parsePropertySlugParam,
  queryToPropertyListFilters,
} from '@avalon/core';
import { getSiteBrandConfig, PORTAL_LISTING_UX_COPY } from '@avalon/config';
import {
  MediaGallery,
  PriceSummary,
  PropertyAskWidget,
  PropertyConsultaForm,
  PropertyFavoriteToggle,
  PropertyViewTracker,
  RecentPropertiesStrip,
} from '@avalon/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ListingFitInsight } from '@/components/listing-fit-insight';
import { ListingSearchContextSummary } from '@/components/listing-search-context-summary';
import { PropertyCardAvalon } from '@/components/property-card-avalon';
import { PropertyMobileCtaAvalon } from '@/components/property-mobile-cta-avalon';
import { decodeListingReturnTo } from '@/lib/listing-return-to';
import { getCachedRawProperties } from '@/lib/raw-properties';
import { listingFiltersHaveContext } from '@/lib/search-context-format';
import { tagsForSimilarProperty } from '@/lib/similar-listing-tags';
import { SITE } from '@/lib/site';

type PageProps = { params: { slug: string }; searchParams: Record<string, string | string[] | undefined> };

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export async function generateMetadata({ params }: Pick<PageProps, 'params'>): Promise<Metadata> {
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

export default async function PropertyDetailPage({ params, searchParams }: PageProps) {
  const id = parsePropertySlugParam(params.slug);
  if (id == null) notFound();
  const raw = await getCachedRawProperties();
  const property = getPropertyByIdFromRaw(SITE, id, raw);
  if (!property) notFound();

  const returnRaw = first(searchParams.returnTo)?.trim();
  const decodedQs = decodeListingReturnTo(returnRaw);
  const contextFilters =
    decodedQs != null && decodedQs.length > 0
      ? queryToPropertyListFilters(new URLSearchParams(decodedQs))
      : null;
  const contextActive =
    contextFilters != null && listingFiltersHaveContext(contextFilters) ? contextFilters : null;
  const returnToToken = returnRaw && returnRaw.length > 0 ? returnRaw : null;

  const related = getRelatedPropertiesFromRaw(SITE, property, raw, 3);
  const brand = getSiteBrandConfig(SITE);
  const waDigits =
    property.agent.phone_whatsapp?.replace(/\D/g, '') || brand.contact.whatsapp || '';
  const C = PORTAL_LISTING_UX_COPY.cta;
  const telHref = `tel:${(property.agent.phone ?? brand.contact.phoneTel).replace(/\s/g, '')}`;
  const waConsult = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(`${C.consultThisProperty}: ${property.title}`)}`
    : telHref;
  const waVisit = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(`${C.scheduleVisit}: ${property.title}`)}`
    : telHref;

  const mapUrl =
    property.location.latitude != null &&
    property.location.longitude != null &&
    !property.location.hideExactLocation
      ? `https://maps.google.com/maps?q=${property.location.latitude},${property.location.longitude}&z=15&output=embed`
      : null;

  return (
    <article className="mx-auto max-w-6xl px-4 py-10 pb-28 md:px-6 md:pb-10">
      <PropertyViewTracker site={SITE} property={property} />
      <nav className="text-sm text-brand-muted">
        <Link href="/propiedades" className="hover:text-brand-primary">
          Propiedades
        </Link>
        <span className="mx-2">/</span>
        <span className="text-brand-text">{property.title}</span>
      </nav>

      {decodedQs ? (
        <div className="mt-4 rounded-lg border border-brand-primary/10 bg-brand-surface-alt/50 px-4 py-2.5 text-sm">
          <Link
            href={`/propiedades?${decodedQs}#buscar-listing-${property.id}`}
            className="font-medium text-brand-primary transition hover:text-brand-primary-mid"
          >
            ← {PORTAL_LISTING_UX_COPY.backToResults}
          </Link>
        </div>
      ) : null}

      {contextActive ? (
        <div className="mt-4 space-y-3">
          <ListingSearchContextSummary filters={contextActive} />
          <ListingFitInsight property={property} filters={contextActive} />
        </div>
      ) : null}

      <div className="mt-4 flex justify-end">
        <PropertyFavoriteToggle site={SITE} property={property} variant="avalon" />
      </div>

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="lg:col-start-1 lg:row-start-1">
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
        <aside className="space-y-6 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start">
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
                <>
                  <a
                    className="rounded-md bg-brand-primary py-3 text-center text-sm font-semibold text-white transition active:scale-[0.99]"
                    href={waConsult}
                  >
                    {C.consultThisProperty}
                  </a>
                  <a
                    className="rounded-md border border-brand-primary py-3 text-center text-sm font-semibold text-brand-primary transition active:scale-[0.99]"
                    href={waVisit}
                  >
                    {C.scheduleVisit}
                  </a>
                </>
              ) : (
                <a
                  className="rounded-md bg-brand-primary py-3 text-center text-sm font-semibold text-white transition active:scale-[0.99]"
                  href={telHref}
                >
                  {C.consultThisProperty}
                </a>
              )}
              <a
                href="#consulta-propiedad"
                className="rounded-md border border-brand-primary/15 bg-brand-surface-alt py-3 text-center text-sm font-semibold text-brand-primary transition active:scale-[0.99]"
              >
                {C.moreInfo}
              </a>
              <a
                className="rounded-md border border-brand-primary/20 py-2.5 text-center text-xs font-medium text-brand-muted transition active:scale-[0.99]"
                href={telHref}
              >
                {C.call}
              </a>
            </div>
            <div id="consulta-propiedad" className="mt-6 scroll-mt-28">
              <PropertyConsultaForm propertyId={property.id} variant="avalon" />
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
        <section className="mt-8 grid gap-8 border-t border-brand-primary/10 pt-8 lg:col-start-1 lg:row-start-2 lg:mt-0 lg:border-t-0 lg:pt-0 lg:grid-cols-2">
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
      </div>

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

      <RecentPropertiesStrip site={SITE} variant="avalon" propertyPathPrefix="/propiedades" />

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-brand-primary">
            {PORTAL_LISTING_UX_COPY.similarSection.title}
          </h2>
          <p className="mt-2 text-sm text-brand-muted">{PORTAL_LISTING_UX_COPY.similarSection.subtitle}</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PropertyCardAvalon
                key={p.id}
                property={p}
                site={SITE}
                returnToToken={returnToToken}
                badges={tagsForSimilarProperty(p, property, related)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {waDigits ? (
        <PropertyMobileCtaAvalon
          waDigits={waDigits}
          propertyTitle={property.title}
          telHref={telHref}
        />
      ) : null}
    </article>
  );
}
