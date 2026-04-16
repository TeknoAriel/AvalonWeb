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
    if (!favOn) return;
    setMounted(true);
    setN(readFavoriteSnapshots(props.site).length);
    const h = (e: Event) => {
      const ce = e as CustomEvent<{ site: SiteType }>;
      if (ce.detail?.site === props.site) setN(readFavoriteSnapshots(props.site).length);
    };
    window.addEventListener(ENGAGEMENT_FAVORITES_EVENT, h);
    return () => window.removeEventListener(ENGAGEMENT_FAVORITES_EVENT, h);
  }, [favOn, props.site]);

  if (!favOn || !mounted) return null;

  const isPremier = props.variant === 'premier';

  return (
    <Link
      href="/favoritos"
      className={cn(
        'text-sm font-medium',
        isPremier ? 'text-brand-text/70 hover:text-brand-accent' : 'text-brand-primary hover:text-brand-primary-mid',
      )}
    >
      Favoritos{n > 0 ? ` (${n})` : ''}
    </Link>
  );
}
