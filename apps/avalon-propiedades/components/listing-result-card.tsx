'use client';

import { PORTAL_LISTING_UX_COPY } from '@avalon/config';
import { cn } from '@avalon/utils';
import { useEffect, useState, type ReactNode } from 'react';

/**
 * Ancla `#buscar-listing-{id}` + highlight suave y badge temporal al volver desde la ficha.
 */
export function ListingResultCard({ listingId, children }: { listingId: number; children: ReactNode }) {
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    let clearTimer: number | undefined;

    const sync = () => {
      if (clearTimer != null) {
        window.clearTimeout(clearTimer);
        clearTimer = undefined;
      }
      const h = window.location.hash;
      const m = h.match(/^#buscar-listing-(\d+)$/);
      const hit = m && Number.parseInt(m[1], 10) === listingId;
      setHighlight(Boolean(hit));
      if (hit) {
        clearTimer = window.setTimeout(() => setHighlight(false), 4500);
      }
    };

    sync();
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      if (clearTimer != null) window.clearTimeout(clearTimer);
    };
  }, [listingId]);

  return (
    <div
      className={cn(
        'relative rounded-xl transition-[box-shadow,transform] duration-500',
        highlight && 'shadow-md shadow-brand-primary/10 ring-1 ring-brand-primary/25',
      )}
    >
      {highlight ? (
        <span className="absolute left-1/2 top-2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-primary px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-white">
          {PORTAL_LISTING_UX_COPY.listingHighlight.badge}
        </span>
      ) : null}
      <div className={cn(highlight && 'pt-7')}>{children}</div>
    </div>
  );
}
