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
            <FavoriteListCard
              key={p.id}
              site={SITE}
              snapshot={p}
              variant="avalon"
              href={`/propiedades/${p.slug}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
