'use client';

import type { SiteType } from '@avalon/types';
import type { FavoriteSnapshot } from '@avalon/utils';
import Image from 'next/image';
import Link from 'next/link';
import { FavoriteRemoveButton } from './favorite-remove-button';

type Variant = 'avalon' | 'premier';

export function FavoriteListCard(props: {
  site: SiteType;
  snapshot: FavoriteSnapshot;
  variant: Variant;
  href: string;
}) {
  const { snapshot: p, variant, href } = props;
  const isPremier = variant === 'premier';
  return (
    <div
      className={
        isPremier
          ? 'relative overflow-hidden border border-premier-line/40 bg-brand-surface-alt/30'
          : 'relative flex flex-col overflow-hidden rounded-xl border border-brand-primary/10 bg-white shadow-sm'
      }
    >
      <Link href={href} className="block">
        <div
          className={
            isPremier
              ? 'relative aspect-[5/4] bg-brand-primary/[0.06]'
              : 'relative aspect-[4/3] bg-brand-surface-alt'
          }
        >
          {p.thumbUrl ? (
            <Image src={p.thumbUrl} alt="" fill className="object-cover" sizes="50vw" />
          ) : null}
        </div>
        <div className={isPremier ? 'space-y-2 px-2 py-5' : 'p-4'}>
          <h2
            className={
              isPremier
                ? 'font-serif text-lg font-semibold text-brand-primary'
                : 'line-clamp-2 text-base font-semibold text-brand-primary'
            }
          >
            {p.title}
          </h2>
          {p.subtitle ? (
            <p className={isPremier ? 'text-xs text-brand-text/55' : 'mt-1 text-xs text-brand-muted'}>
              {p.subtitle}
            </p>
          ) : null}
        </div>
      </Link>
      <FavoriteRemoveButton
        site={props.site}
        propertyId={p.id}
        variant={variant}
        className="absolute right-2 top-2"
      />
    </div>
  );
}
