import type { NormalizedProperty, SiteType } from '@avalon/types';
import { CompareToggle, PriceSummary, PropertyFavoriteToggle } from '@avalon/ui';
import Image from 'next/image';
import Link from 'next/link';

export function PropertyCardAvalon({
  property,
  site,
}: {
  property: NormalizedProperty;
  site: SiteType;
}) {
  const img = property.media.images[0];
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-brand-primary/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/propiedades/${property.slug}`} className="group flex flex-1 flex-col">
        <div className="relative aspect-[4/3] bg-brand-surface-alt">
          {img ? (
            <Image
              src={img.url}
              alt={img.alt}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
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
