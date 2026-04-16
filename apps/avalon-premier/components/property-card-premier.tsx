import type { NormalizedProperty, SiteType } from '@avalon/types';
import { CompareToggle, PriceSummary, PropertyFavoriteToggle } from '@avalon/ui';
import Image from 'next/image';
import Link from 'next/link';

export function PropertyCardPremier({
  property,
  site,
}: {
  property: NormalizedProperty;
  site: SiteType;
}) {
  const img = property.media.images[0];
  return (
    <div className="overflow-hidden border border-premier-line/50 bg-brand-surface shadow-sm shadow-stone-900/[0.04] transition duration-500 hover:border-premier-line/70 hover:shadow-md hover:shadow-stone-900/[0.06]">
      <Link href={`/propiedades/${property.slug}`} className="group block">
        <div className="relative aspect-[4/3] bg-brand-primary/[0.05]">
          {img ? (
            <Image
              src={img.url}
              alt={img.alt}
              fill
              className="object-cover transition duration-700 ease-out group-hover:scale-[1.015]"
              sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
            />
          ) : null}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-stone-950/35 to-transparent opacity-80" />
          <div className="absolute right-2 top-2 z-10">
            <PropertyFavoriteToggle site={site} property={property} variant="premier" />
          </div>
        </div>
        <div className="space-y-2 px-3 py-5 md:px-4 md:py-5">
          <p className="text-[9px] font-medium uppercase tracking-caps text-brand-text/50">
            {property.propertyTypeLabel}
          </p>
          <h3 className="font-serif text-lg font-normal leading-snug tracking-tight text-brand-primary md:text-xl">
            {property.title}
          </h3>
          <p className="text-sm font-light text-brand-text/65">
            {property.location.zone} · {property.location.city}
          </p>
          <PriceSummary property={property} className="text-sm font-medium tabular-nums text-brand-primary" />
        </div>
      </Link>
      <div className="border-t border-premier-line/45 px-4 py-4 md:px-5">
        <CompareToggle site={site} propertyId={property.id} variant="premier" />
      </div>
    </div>
  );
}
