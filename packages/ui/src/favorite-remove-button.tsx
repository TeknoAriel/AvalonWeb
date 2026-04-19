'use client';

import { isFeatureEnabled } from '@avalon/config';
import type { SiteType } from '@avalon/types';
import { cn, removeFavoriteById } from '@avalon/utils';

type Variant = 'avalon' | 'premier';

export function FavoriteRemoveButton(props: {
  site: SiteType;
  propertyId: number;
  variant: Variant;
  className?: string;
}) {
  if (!isFeatureEnabled('favorites')) return null;
  const isPremier = props.variant === 'premier';
  return (
    <button
      type="button"
      aria-label="Quitar de favoritos"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        removeFavoriteById(props.site, props.propertyId);
      }}
      className={cn(
        'z-20 rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-sm backdrop-blur transition',
        isPremier
          ? 'border-premier-line/70 bg-brand-bg/95 text-brand-primary hover:border-red-900/35 hover:text-red-900'
          : 'border-brand-primary/20 bg-white/95 text-brand-primary hover:border-red-600/40 hover:text-red-700',
        props.className,
      )}
    >
      Quitar
    </button>
  );
}
