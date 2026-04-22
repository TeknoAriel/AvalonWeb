'use client';

import { cn } from '@avalon/utils';

export function PropertyCtaBar(props: {
  infoHref: string;
  visitHref?: string;
  telHref?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-[60] border-t border-premier-line/50 bg-brand-bg/95 px-4 py-3.5 backdrop-blur-md md:hidden',
        props.className
      )}
    >
      <div className="mx-auto flex max-w-lg flex-col gap-2.5">
        <div className="flex gap-3">
          <a
            href={props.infoHref}
            className="flex-1 border border-brand-primary/70 py-3 text-center text-[10px] font-medium uppercase tracking-caps text-brand-primary"
          >
            Solicitar información
          </a>
          {props.visitHref ? (
            <a
              href={props.visitHref}
              className="flex-1 border border-premier-line/55 py-3 text-center text-[10px] font-medium uppercase tracking-caps text-brand-text/85"
            >
              WhatsApp
            </a>
          ) : null}
        </div>
        {props.telHref ? (
          <a
            href={props.telHref}
            className="block text-center text-[10px] font-light uppercase tracking-caps text-brand-text/50 underline-offset-4 hover:text-brand-primary hover:underline"
          >
            Llamar
          </a>
        ) : null}
      </div>
    </div>
  );
}
