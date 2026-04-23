'use client';

import type { PropertyMedia } from '@avalon/types';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { cn } from '@avalon/utils';

export interface MediaGalleryProps {
  media: PropertyMedia;
  brand: 'avalon' | 'premier';
  className?: string;
  /** Galería horizontal tipo editorial (Premier). */
  layout?: 'default' | 'editorial';
}

export function MediaGallery({ media, brand, className, layout = 'default' }: MediaGalleryProps) {
  const [idx, setIdx] = useState(0);
  const images = media.images;
  const current = images[idx] ?? images[0];
  const thumbs = useMemo(() => images, [images]);

  if (!current) {
    return (
      <div
        className={cn(
          'flex aspect-[16/10] items-center justify-center rounded-xl bg-black/5 text-sm',
          className
        )}
      >
        Sin fotos disponibles
      </div>
    );
  }

  const ring =
    brand === 'premier'
      ? 'ring-1 ring-[color:var(--color-brand-accent)]/40'
      : 'ring-1 ring-[color:var(--color-brand-primary)]/15';

  if (layout === 'editorial') {
    return (
      <div className={cn('space-y-6', className)}>
        <div
          className={cn(
            'relative aspect-[21/9] min-h-[220px] overflow-hidden bg-neutral-950 sm:min-h-[320px]',
            ring
          )}
        >
          <Image
            src={current.url}
            alt={current.alt}
            fill
            className="object-cover"
            sizes="100vw"
            priority={idx === 0}
          />
        </div>
        {images.length > 1 ? (
          <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {images.map((img, i) => (
              <button
                key={`${img.url}-${i}`}
                type="button"
                onClick={() => setIdx(i)}
                className={cn(
                  'relative h-24 w-40 shrink-0 overflow-hidden border-2 transition duration-300 md:h-28 md:w-48',
                  i === idx
                    ? 'border-[color:var(--color-brand-accent)] opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-100'
                )}
              >
                <Image src={img.url} alt="" fill className="object-cover" sizes="200px" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'relative aspect-[16/10] overflow-hidden rounded-xl bg-black/5 shadow-sm',
          ring
        )}
      >
        <Image
          src={current.url}
          alt={current.alt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority={idx === 0}
        />
      </div>
      {thumbs.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-8 sm:gap-2 sm:overflow-visible sm:pb-0">
          {thumbs.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              onClick={() => setIdx(i)}
              className={cn(
                'relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg border-2 transition sm:w-auto',
                i === idx
                  ? 'border-[color:var(--color-brand-accent)] opacity-100'
                  : 'border-transparent opacity-70 hover:opacity-100'
              )}
            >
              <Image src={img.url} alt="" fill className="object-cover" sizes="120px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
