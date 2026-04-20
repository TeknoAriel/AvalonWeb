import type { NormalizedProperty, SiteType } from '@avalon/types';
import { CompareToggle, PriceSummary, PropertyFavoriteToggle } from '@avalon/ui';
import Image from 'next/image';
import Link from 'next/link';

export function PropertyCardAvalon({
  property,
  site,
  returnToToken,
  badges,
}: {
  property: NormalizedProperty;
  site: SiteType;
  /** Token `returnTo` (base64url del query del listado) para continuidad en ficha. */
  returnToToken?: string | null;
  badges?: readonly string[];
}) {
  const img = property.media.images[0];
  const editorialBadge = property.editorial.isFeatured ? ['Destacada'] : [];
  const mergedBadges = Array.from(new Set([...editorialBadge, ...(badges ?? [])]));
  const href =
    returnToToken && returnToToken.length > 0
      ? `/propiedades/${property.slug}?returnTo=${encodeURIComponent(returnToToken)}`
      : `/propiedades/${property.slug}`;
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-brand-primary/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
      <Link
        href={href}
        className="group flex flex-1 flex-col active:scale-[0.99]"
      >
        <div className="relative aspect-[4/3] bg-brand-surface-alt">
          {img ? (
            <Image
              src={img.url}
              alt={img.alt}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
              sizes="(max-width:768px) 100vw, 33vw"
            />
          ) : null}
          <div className="absolute left-3 top-3 rounded bg-brand-primary px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
            {property.propertyTypeLabel}
          </div>
          <div className="absolute right-2 top-2 z-10">
            <PropertyFavoriteToggle site={site} property={property} variant="avalon" />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-brand-primary group-hover:text-brand-primary-mid">
            {property.title}
          </h3>
          <p className="text-sm text-brand-muted">
            {property.location.zone}
            {property.location.zoneSecondary ? ` · ${property.location.zoneSecondary}` : ''} —{' '}
            {property.location.city}
          </p>
          {mergedBadges.length > 0 ? (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {mergedBadges.slice(0, 2).map((b) => (
                <span
                  key={b}
                  className="rounded bg-brand-primary/[0.06] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand-primary/90"
                >
                  {b}
                </span>
              ))}
            </div>
          ) : null}
          <PriceSummary
            property={property}
            className="mt-auto text-sm font-bold text-brand-primary"
          />
        </div>
      </Link>
      <div className="border-t border-brand-primary/10 bg-brand-surface-alt/40 px-4 py-3">
        <CompareToggle site={site} propertyId={property.id} variant="avalon" />
      </div>
    </div>
  );
}
