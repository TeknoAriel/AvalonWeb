'use client';

import type { SiteType } from '@avalon/types';
import { cn } from '@avalon/utils';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { COMPARE_CHANGE_EVENT, readCompareIds } from './compare-storage';

export interface CompareDockProps {
  site: SiteType;
  variant: 'avalon' | 'premier';
  compareHref: string;
}

export function CompareDock({ site, variant, compareHref }: CompareDockProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(readCompareIds(site).length);
    update();
    const onChange = (e: Event) => {
      const ce = e as CustomEvent<{ site: SiteType }>;
      if (ce.detail?.site === site) update();
    };
    window.addEventListener(COMPARE_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(COMPARE_CHANGE_EVENT, onChange);
  }, [site]);

  if (count === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t px-4 py-3 shadow-lg md:px-6',
        variant === 'avalon' && 'border-brand-primary/15 bg-white/95 backdrop-blur',
        variant === 'premier' &&
          'border-brand-text/10 bg-brand-surface/95 shadow-[0_-4px_24px_rgba(27,33,48,0.06)] backdrop-blur-md'
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <p
          className={cn(
            'text-sm',
            variant === 'avalon' && 'text-brand-primary',
            variant === 'premier' && 'font-serif text-brand-primary'
          )}
        >
          {count} propiedad{count === 1 ? '' : 'es'} para comparar
        </p>
        <Link
          href={compareHref}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-semibold',
            variant === 'avalon' && 'bg-brand-primary text-white',
            variant === 'premier' && 'bg-brand-primary text-brand-surface'
          )}
        >
          Ver tabla
        </Link>
      </div>
    </div>
  );
}
