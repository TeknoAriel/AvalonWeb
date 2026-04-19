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
    <div className="overflow-hidden border border-premier-line/45 bg-brand-surface shadow-sm shadow-stone-900/[0.03] transition duration-300 hover:border-premier-line/65 hover:shadow-md hover:shadow-stone-900/[0.05]">
      <Link href={`/propiedades/${property.slug}`} className="group block">
        <div className="relative aspect-[4/3] bg-brand-primary/[0.04]">
          {img ? (
            <Image
              src={img.url}
              alt={img.alt}
              fill
              className="object-cover transition duration-[480ms] ease-out group-hover:scale-[1.006]"
              sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
            />
          ) : null}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-stone-950/30 to-transparent opacity-75" />
          <div className="absolute right-2 top-2 z-10">
            <PropertyFavoriteToggle site={site} property={property} variant="premier" />
          </div>
        </div>
        <div className="space-y-2.5 px-3 py-5 md:px-5 md:py-6">
          <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-brand-text/48">
            {property.propertyTypeLabel}
          </p>
          <h3 className="font-serif text-lg font-normal leading-[1.35] tracking-[-0.015em] text-brand-primary md:text-[1.15rem]">
            {property.title}
          </h3>
          <p className="text-[13px] font-light leading-relaxed tracking-wide text-brand-text/58">
            {property.location.zone} · {property.location.city}
          </p>
          <PriceSummary
            property={property}
            className="space-y-0.5 pt-1 text-sm font-normal tabular-nums tracking-tight text-brand-primary"
          />
        </div>
      </Link>
      <div className="border-t border-premier-line/45 px-4 py-4 md:px-5">
        <CompareToggle site={site} propertyId={property.id} variant="premier" />
      </div>
    </div>
  );
}
