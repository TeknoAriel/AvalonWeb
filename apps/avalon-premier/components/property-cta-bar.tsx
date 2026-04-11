'use client';

import { cn } from '@avalon/utils';

export function PropertyCtaBar(props: {
  infoHref: string;
  visitHref: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-[60] border-t border-premier-line/50 bg-brand-bg/95 px-4 py-3 backdrop-blur-md md:hidden',
        props.className
      )}
    >
      <div className="mx-auto flex max-w-lg gap-3">
        <a
          href={props.infoHref}
          className="flex-1 border border-brand-primary py-3 text-center text-[10px] font-medium uppercase tracking-caps text-brand-primary"
        >
          Solicitar información
        </a>
        <a
          href={props.visitHref}
          className="flex-1 bg-brand-accent py-3 text-center text-[10px] font-medium uppercase tracking-caps text-premier-ink"
        >
          Coordinar visita
        </a>
      </div>
    </div>
  );
}
