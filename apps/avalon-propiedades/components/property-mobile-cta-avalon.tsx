'use client';

import { PORTAL_LISTING_UX_COPY } from '@avalon/config';
import { cn } from '@avalon/utils';
import Link from 'next/link';

const C = PORTAL_LISTING_UX_COPY.cta;

export function PropertyMobileCtaAvalon(props: {
  waDigits: string;
  propertyTitle: string;
  telHref: string;
  className?: string;
}) {
  if (!props.waDigits) return null;

  const consult = `https://wa.me/${props.waDigits}?text=${encodeURIComponent(`${C.consultThisProperty}: ${props.propertyTitle}`)}`;
  const visit = `https://wa.me/${props.waDigits}?text=${encodeURIComponent(`${C.scheduleVisit}: ${props.propertyTitle}`)}`;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t border-brand-primary/10 bg-white/95 px-3 py-3 backdrop-blur-md md:hidden',
        props.className,
      )}
    >
      <div className="mx-auto flex max-w-lg flex-col gap-2">
        <a
          href={consult}
          className="flex min-h-[48px] items-center justify-center rounded-md bg-brand-primary px-3 py-2.5 text-center text-[11px] font-semibold uppercase leading-tight tracking-wide text-white active:scale-[0.98]"
        >
          {C.consultThisProperty}
        </a>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={visit}
            className="flex min-h-[44px] items-center justify-center rounded-md border border-brand-primary/40 px-2 py-2 text-center text-[10px] font-semibold uppercase leading-tight tracking-wide text-brand-primary active:scale-[0.98]"
          >
            {C.scheduleVisit}
          </a>
          <Link
            href="#consulta-propiedad"
            className="flex min-h-[44px] items-center justify-center rounded-md border border-brand-primary/15 bg-brand-surface-alt px-2 py-2 text-center text-[10px] font-semibold uppercase leading-tight tracking-wide text-brand-primary active:scale-[0.98]"
            scroll
          >
            {C.moreInfo}
          </Link>
        </div>
        <a
          href={props.telHref}
          className="block pb-0.5 text-center text-[10px] font-medium text-brand-muted underline-offset-2 hover:underline"
        >
          {C.call}
        </a>
      </div>
    </div>
  );
}
