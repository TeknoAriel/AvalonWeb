'use client';

import { isFeatureEnabled } from '@avalon/config';
import type { SiteType } from '@avalon/types';
import { cn, ENGAGEMENT_FAVORITES_EVENT, readFavoriteSnapshots } from '@avalon/utils';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Variant = 'avalon' | 'premier';

export function HeaderEngagementLinks(props: { site: SiteType; variant: Variant }) {
  const favOn = isFeatureEnabled('favorites');
  const [n, setN] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!favOn) return;
    setN(readFavoriteSnapshots(props.site).length);
    const h = (e: Event) => {
      const ce = e as CustomEvent<{ site: SiteType }>;
      if (ce.detail?.site === props.site) setN(readFavoriteSnapshots(props.site).length);
    };
    window.addEventListener(ENGAGEMENT_FAVORITES_EVENT, h);
    return () => window.removeEventListener(ENGAGEMENT_FAVORITES_EVENT, h);
  }, [favOn, props.site]);

  const isPremier = props.variant === 'premier';
  const countSuffix = favOn && mounted && n > 0 ? ` (${n})` : '';

  return (
    <Link
      href="/favoritos"
      className={cn(
        'text-sm font-medium',
        isPremier ? 'text-brand-text/70 hover:text-brand-accent' : 'text-brand-primary hover:text-brand-primary-mid',
      )}
    >
      Favoritos{countSuffix}
    </Link>
  );
}

/** Enlace al comparador (misma ruta en ambas apps). En Premier va estilo pill compacto junto a Inicio. */
export function HeaderCompareLink(props: { variant: Variant }) {
  const isPremier = props.variant === 'premier';
  return (
    <Link
      href="/propiedades/comparar"
      className={cn(
        isPremier
          ? 'rounded-sm border border-premier-line/60 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand-primary hover:border-brand-accent/50 hover:text-brand-accent'
          : 'text-sm font-medium text-brand-primary hover:text-brand-primary-mid',
      )}
    >
      Comparar
    </Link>
  );
}
