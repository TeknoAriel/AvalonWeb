'use client';

import { FavoriteListCard } from '@avalon/ui';
import type { FavoriteSnapshot } from '@avalon/utils';
import { readFavoriteSnapshots, ENGAGEMENT_FAVORITES_EVENT } from '@avalon/utils';
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
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
      <p className="text-[11px] font-medium uppercase tracking-caps text-brand-accent">Premier</p>
      <h1 className="mt-2 font-serif text-3xl font-medium text-brand-primary">Favoritos</h1>
      <p className="mt-3 text-sm text-brand-text/60">Shortlist personal en este dispositivo.</p>
      {!mounted ? (
        <p className="mt-8 text-brand-text/50">Cargando…</p>
      ) : list.length === 0 ? (
        <p className="mt-8 text-sm text-brand-text/55">
          Aún no hay favoritos. Marcá «☆ Fav» en la colección o en una ficha.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {list.map((p) => (
            <FavoriteListCard
              key={p.id}
              site={SITE}
              snapshot={p}
              variant="premier"
              href={`/propiedades/${p.slug}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
