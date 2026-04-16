'use client';

import type { FavoriteSnapshot } from '@avalon/utils';
import { readFavoriteSnapshots, ENGAGEMENT_FAVORITES_EVENT } from '@avalon/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SITE } from '@/lib/site';

export default function FavoritosPage() {
  const [list, setList] = useState<FavoriteSnapshot[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setList(readFavoriteSnapshots(SITE));
    const h = () => setList(readFavoriteSnapshots(SITE));
    window.addEventListener(ENGAGEMENT_FAVORITES_EVENT, h);
    return () => window.removeEventListener(ENGAGEMENT_FAVORITES_EVENT, h);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <h1 className="text-3xl font-bold text-brand-primary">Favoritos</h1>
      <p className="mt-2 text-sm text-brand-muted">
        Guardados en este dispositivo. Podés retomarlos o compararlos desde el listado.
      </p>
      {!mounted ? (
        <p className="mt-8 text-brand-muted">Cargando…</p>
      ) : list.length === 0 ? (
        <p className="mt-8 text-brand-muted">
          Todavía no guardaste propiedades. Usá «☆ Fav» en las tarjetas o fichas.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <Link
              key={p.id}
              href={`/propiedades/${p.slug}`}
              className="flex flex-col overflow-hidden rounded-xl border border-brand-primary/10 bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3] bg-brand-surface-alt">
                {p.thumbUrl ? (
                  <Image src={p.thumbUrl} alt="" fill className="object-cover" sizes="33vw" />
                ) : null}
              </div>
              <div className="p-4">
                <h2 className="line-clamp-2 text-base font-semibold text-brand-primary">{p.title}</h2>
                <p className="mt-1 text-xs text-brand-muted">{p.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
