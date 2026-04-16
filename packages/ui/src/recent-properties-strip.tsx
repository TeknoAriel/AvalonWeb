'use client';

import { isFeatureEnabled } from '@avalon/config';
import type { SiteType } from '@avalon/types';
import { cn, ENGAGEMENT_RECENTS_EVENT, readRecentSnapshots, type RecentSnapshot } from '@avalon/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Variant = 'avalon' | 'premier';

export function RecentPropertiesStrip(props: {
  site: SiteType;
  variant: Variant;
  propertyPathPrefix: string;
  title?: string;
}) {
  const enabled = isFeatureEnabled('recents');
  const [list, setList] = useState<RecentSnapshot[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    setMounted(true);
    setList(readRecentSnapshots(props.site));
    const h = (e: Event) => {
      const ce = e as CustomEvent<{ site: SiteType }>;
      if (ce.detail?.site === props.site) setList(readRecentSnapshots(props.site));
    };
    window.addEventListener(ENGAGEMENT_RECENTS_EVENT, h);
    return () => window.removeEventListener(ENGAGEMENT_RECENTS_EVENT, h);
  }, [props.site, enabled]);

  if (!enabled || !mounted || list.length === 0) return null;

  const isPremier = props.variant === 'premier';

  return (
    <section className="mt-10 border-t border-brand-primary/10 pt-8">
      <h3
        className={cn(
          'text-sm font-semibold',
          isPremier ? 'font-serif text-brand-primary' : 'text-brand-primary',
        )}
      >
        {props.title ?? 'Vistos recientemente'}
      </h3>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
        {list.slice(0, 8).map((p) => (
          <Link
            key={`${p.id}-${p.viewedAt}`}
            href={`${props.propertyPathPrefix}/${p.slug}`}
            className={cn(
              'flex w-40 shrink-0 flex-col overflow-hidden rounded-lg border transition hover:opacity-95',
              isPremier ? 'border-premier-line/40 bg-brand-bg' : 'border-brand-primary/10 bg-white',
            )}
          >
            <div className="relative aspect-[4/3] bg-black/5">
              {p.thumbUrl ? (
                <Image src={p.thumbUrl} alt="" fill className="object-cover" sizes="160px" />
              ) : null}
            </div>
            <p className="line-clamp-2 px-2 py-2 text-[11px] leading-snug text-brand-text">{p.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
