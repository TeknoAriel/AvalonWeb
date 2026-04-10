'use client';

import type { PropertyMedia } from '@avalon/types';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { cn } from '@avalon/utils';

export interface MediaGalleryProps {
  media: PropertyMedia;
  brand: 'avalon' | 'premier';
  className?: string;
}

export function MediaGallery({ media, brand, className }: MediaGalleryProps) {
  const [idx, setIdx] = useState(0);
  const images = media.images;
  const current = images[idx] ?? images[0];

  const thumbs = useMemo(() => images.slice(0, 8), [images]);

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
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {thumbs.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setIdx(i)}
              className={cn(
                'relative aspect-[4/3] overflow-hidden rounded-lg border-2 transition',
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
