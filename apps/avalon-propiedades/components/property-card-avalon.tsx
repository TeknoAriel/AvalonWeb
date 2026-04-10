import type { NormalizedProperty } from '@avalon/types';
import { PriceSummary } from '@avalon/ui';
import Image from 'next/image';
import Link from 'next/link';

export function PropertyCardAvalon({ property }: { property: NormalizedProperty }) {
  const img = property.media.images[0];
  return (
    <Link
      href={`/propiedades/${property.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-brand-primary/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
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
  );
}
