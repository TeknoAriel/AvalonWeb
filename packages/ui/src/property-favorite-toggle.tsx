'use client';

import { isFeatureEnabled } from '@avalon/config';
import type { NormalizedProperty, SiteType } from '@avalon/types';
import { cn, ENGAGEMENT_FAVORITES_EVENT, isFavorite, toggleFavoriteSnapshot } from '@avalon/utils';
import { useCallback, useEffect, useState } from 'react';

type Variant = 'avalon' | 'premier';

export function PropertyFavoriteToggle(props: {
  site: SiteType;
  property: NormalizedProperty;
  variant: Variant;
}) {
  const enabled = isFeatureEnabled('favorites');
  const [on, setOn] = useState(false);
  const [mounted, setMounted] = useState(false);

  const sync = useCallback(() => {
    setOn(isFavorite(props.site, props.property.id));
  }, [props.site, props.property.id]);

  useEffect(() => {
    setMounted(true);
    sync();
    const h = (e: Event) => {
      const ce = e as CustomEvent<{ site: SiteType }>;
      if (ce.detail?.site === props.site) sync();
    };
    window.addEventListener(ENGAGEMENT_FAVORITES_EVENT, h);
    return () => window.removeEventListener(ENGAGEMENT_FAVORITES_EVENT, h);
  }, [props.site, sync]);

  if (!enabled || !mounted) return null;

  const img = props.property.media.images[0];
  const snap = {
    id: props.property.id,
    slug: props.property.slug,
    title: props.property.title,
    thumbUrl: img?.url ?? null,
    subtitle: `${props.property.location.zone} · ${props.property.location.city}`,
  };

  const isPremier = props.variant === 'premier';

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const now = toggleFavoriteSnapshot(props.site, snap);
        setOn(now);
      }}
      className={cn(
        'rounded-full px-2 py-1 text-xs font-semibold shadow-sm backdrop-blur transition',
        on
          ? isPremier
            ? 'bg-brand-primary text-brand-surface'
            : 'bg-brand-primary text-white'
          : isPremier
            ? 'bg-brand-bg/90 text-brand-primary ring-1 ring-premier-line/50'
            : 'bg-white/90 text-brand-primary ring-1 ring-brand-primary/15',
      )}
    >
      {on ? '★' : '☆'} Fav
    </button>
  );
}
