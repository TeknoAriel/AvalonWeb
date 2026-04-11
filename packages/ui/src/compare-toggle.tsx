'use client';

import type { SiteType } from '@avalon/types';
import { cn } from '@avalon/utils';
import { useEffect, useState } from 'react';
import {
  COMPARE_CHANGE_EVENT,
  COMPARE_MAX,
  readCompareIds,
  toggleCompareId,
} from './compare-storage';

export interface CompareToggleProps {
  site: SiteType;
  propertyId: number;
  variant: 'avalon' | 'premier';
  className?: string;
}

export function CompareToggle({ site, propertyId, variant, className }: CompareToggleProps) {
  const [active, setActive] = useState(false);
  const [maxWarn, setMaxWarn] = useState(false);

  const sync = () => setActive(readCompareIds(site).includes(propertyId));

  useEffect(() => {
    sync();
    const onChange = (e: Event) => {
      const ce = e as CustomEvent<{ site: SiteType }>;
      if (ce.detail?.site === site) sync();
    };
    window.addEventListener(COMPARE_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(COMPARE_CHANGE_EVENT, onChange);
  }, [site, propertyId]);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        onClick={(ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          setMaxWarn(false);
          const r = toggleCompareId(site, propertyId);
          setActive(r.ids.includes(propertyId));
          if (r.reason === 'max') setMaxWarn(true);
        }}
        className={cn(
          'rounded-md px-3 py-2 text-xs font-semibold transition',
          variant === 'avalon' &&
            (active
              ? 'bg-brand-primary text-white'
              : 'border border-brand-primary/25 bg-white text-brand-primary hover:border-brand-primary/50'),
          variant === 'premier' &&
            (active
              ? 'bg-brand-primary text-brand-surface'
              : 'border border-brand-accent/40 text-brand-primary hover:border-brand-accent')
        )}
      >
        {active ? 'En comparación' : 'Comparar'}
      </button>
      {maxWarn ? (
        <span className="text-[10px] text-red-600 md:text-xs">Máximo {COMPARE_MAX} ítems</span>
      ) : null}
    </div>
  );
}
