import type { NormalizedProperty, SiteType } from '@avalon/types';
import { CompareToggle, PriceSummary } from '@avalon/ui';
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
    <div className="overflow-hidden bg-brand-surface-alt/40 transition hover:bg-brand-surface-alt/70">
      <Link href={`/propiedades/${property.slug}`} className="group block">
        <div className="relative aspect-[5/4] bg-black/5">
          {img ? (
            <Image
              src={img.url}
              alt={img.alt}
              fill
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
              sizes="(max-width:768px) 100vw, 50vw"
            />
          ) : null}
        </div>
        <div className="space-y-3 px-1 py-6 md:px-2">
          <p className="text-[11px] font-medium uppercase tracking-caps text-brand-accent">
            {property.propertyTypeLabel}
          </p>
          <h3 className="font-serif text-xl font-semibold leading-snug text-brand-primary md:text-2xl">
            {property.title}
          </h3>
          <p className="text-sm text-brand-text/70">
            {property.location.zone} · {property.location.city}
          </p>
          <PriceSummary property={property} className="text-sm font-medium text-brand-primary" />
        </div>
      </Link>
      <div className="border-t border-brand-accent/15 px-1 py-4 md:px-2">
        <CompareToggle site={site} propertyId={property.id} variant="premier" />
      </div>
    </div>
  );
}
