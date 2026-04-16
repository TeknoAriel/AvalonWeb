'use client';

import { isFeatureEnabled } from '@avalon/config';
import { cn, trackAvalonEvent } from '@avalon/utils';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

type Variant = 'avalon' | 'premier';

export function NaturalSearchBar(props: {
  variant: Variant;
  cities: string[];
  siteKey: 'avalon' | 'premier';
  /** Ruta del listado (default `/propiedades`) */
  listPath?: string;
}) {
  const listPath = props.listPath ?? '/propiedades';
  const enabled = isFeatureEnabled('nl_search');
  const router = useRouter();
  const [q, setQ] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!enabled) return null;

  const isPremier = props.variant === 'premier';

  function apply() {
    const trimmed = q.trim();
    if (!trimmed) return;
    start(async () => {
      trackAvalonEvent('natural_search_submitted', { site: props.siteKey });
      try {
        const res = await fetch('/api/ai/parse-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: trimmed, cities: props.cities }),
        });
        const data = (await res.json()) as {
          query?: string;
          understood?: string[];
          usedMcpBridge?: boolean;
        };
        if (data.understood?.length) {
          setHint(data.understood.join(' · '));
          trackAvalonEvent('natural_search_parsed', {
            site: props.siteKey,
            mcp: data.usedMcpBridge ? 1 : 0,
          });
        } else setHint(null);
        const qs = typeof data.query === 'string' ? data.query : '';
        router.push(qs ? `${listPath}?${qs}` : listPath);
      } catch {
        setHint('No se pudo interpretar; probá con filtros manuales.');
      }
    });
  }

  return (
    <div className="mb-4 rounded-xl border border-brand-primary/10 bg-white p-3 md:p-4">
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-brand-muted">
        Búsqueda en lenguaje natural
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && apply()}
            disabled={pending}
            placeholder={
              isPremier
                ? 'Ej.: depto 2 dorm con vista, apto crédito…'
                : 'Ej.: casa con pileta en Funes, hasta 200 mil…'
            }
            className={cn(
              'min-h-[44px] flex-1 rounded-md border px-3 py-2 text-sm outline-none',
              isPremier
                ? 'border-premier-line/50 bg-brand-bg text-brand-text'
                : 'border-brand-primary/20 text-brand-text',
            )}
          />
          <button
            type="button"
            disabled={pending}
            onClick={apply}
            className={cn(
              'min-h-[44px] shrink-0 rounded-md px-4 text-sm font-semibold',
              isPremier
                ? 'border border-brand-primary text-brand-primary hover:bg-brand-primary/5'
                : 'bg-brand-primary text-white hover:bg-brand-primary-mid',
            )}
          >
            {pending ? '…' : 'Aplicar'}
          </button>
        </div>
      </label>
      {hint ? <p className="mt-2 text-xs text-brand-muted">Entendimos: {hint}</p> : null}
    </div>
  );
}
