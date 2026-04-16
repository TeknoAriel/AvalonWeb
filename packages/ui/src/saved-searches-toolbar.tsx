'use client';

import { isFeatureEnabled } from '@avalon/config';
import { addSavedSearch, cn, readSavedSearches, ENGAGEMENT_SAVED_EVENT, trackAvalonEvent } from '@avalon/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useId, useState } from 'react';

type Variant = 'avalon' | 'premier';

function randomId() {
  return `ss_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function SavedSearchesToolbar(props: { variant: Variant; siteKey: 'avalon' | 'premier' }) {
  const enabled = isFeatureEnabled('saved_search');
  const sp = useSearchParams();
  const router = useRouter();
  const listId = useId();
  const [saved, setSaved] = useState(readSavedSearches(props.siteKey === 'avalon' ? 'avalon' : 'premier'));
  const [mounted, setMounted] = useState(false);

  const site = props.siteKey === 'avalon' ? 'avalon' : 'premier';

  const reload = useCallback(() => {
    setSaved(readSavedSearches(site));
  }, [site]);

  useEffect(() => {
    if (!enabled) return;
    setMounted(true);
    reload();
    const h = (e: Event) => {
      const ce = e as CustomEvent<{ site: string }>;
      if (ce.detail?.site === site) reload();
    };
    window.addEventListener(ENGAGEMENT_SAVED_EVENT, h);
    return () => window.removeEventListener(ENGAGEMENT_SAVED_EVENT, h);
  }, [enabled, reload, site]);

  if (!enabled || !mounted) return null;

  const isPremier = props.variant === 'premier';

  function saveCurrent() {
    const name = window.prompt('Nombre para esta búsqueda (ej.: Casa Funes)');
    if (!name || !name.trim()) return;
    const q = sp.toString();
    if (!q.trim()) {
      window.alert('Aplicá al menos un filtro antes de guardar.');
      return;
    }
    addSavedSearch(site, {
      id: randomId(),
      name: name.trim().slice(0, 80),
      createdAt: new Date().toISOString(),
      query: q,
    });
    reload();
  }

  function loadSaved(query: string) {
    router.push(`/propiedades?${query}`);
    trackAvalonEvent('saved_search_loaded', { site });
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={saveCurrent}
        className={cn(
          'rounded-md border px-3 py-2 text-xs font-semibold',
          isPremier
            ? 'border-premier-line/50 text-brand-primary hover:bg-brand-surface-alt/40'
            : 'border-brand-primary/20 text-brand-primary hover:bg-brand-surface-alt',
        )}
      >
        Guardar búsqueda actual
      </button>
      {saved.length > 0 ? (
        <label className="flex items-center gap-2 text-xs text-brand-muted">
          <span className="whitespace-nowrap">Recuperar:</span>
          <select
            id={listId}
            className={cn(
              'max-w-[200px] rounded-md border py-1.5 text-xs',
              isPremier ? 'border-premier-line/50 bg-brand-bg' : 'border-brand-primary/20 bg-white',
            )}
            defaultValue=""
            onChange={(e) => {
              const v = e.target.value;
              e.target.value = '';
              if (v) loadSaved(v);
            }}
          >
            <option value="">Elegí…</option>
            {saved.map((s) => (
              <option key={s.id} value={s.query}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  );
}
