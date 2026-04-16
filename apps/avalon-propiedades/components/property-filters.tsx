'use client';

import { isFeatureEnabled } from '@avalon/config';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';

const OPS = [
  { value: 'all', label: 'Operación' },
  { value: 'sale', label: 'Venta' },
  { value: 'rent', label: 'Alquiler' },
  { value: 'temp', label: 'Temporal' },
];

export function PropertyFilters(props: {
  cities: string[];
  types: { value: string; label: string }[];
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const advanced = isFeatureEnabled('extended_filters');

  const setParam = useCallback(
    (key: string, value: string) => {
      start(() => {
        const next = new URLSearchParams(sp.toString());
        if (!value || value === 'all') next.delete(key);
        else next.set(key, value);
        router.push(`?${next.toString()}`);
      });
    },
    [router, sp],
  );

  return (
    <div>
      <div className="grid gap-3 rounded-xl border border-brand-primary/10 bg-white p-4 md:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-brand-muted">
          Operación
          <select
            className="rounded-md border border-brand-primary/20 bg-white px-2 py-2 text-sm font-normal text-brand-text"
            defaultValue={sp.get('op') ?? 'all'}
            disabled={pending}
            onChange={(e) => setParam('op', e.target.value)}
          >
            {OPS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-brand-muted">
          Tipo
          <select
            className="rounded-md border border-brand-primary/20 bg-white px-2 py-2 text-sm font-normal text-brand-text"
            defaultValue={sp.get('type') ?? 'all'}
            disabled={pending}
            onChange={(e) => setParam('type', e.target.value)}
          >
            <option value="all">Todos</option>
            {props.types.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-brand-muted">
          Ciudad
          <select
            className="rounded-md border border-brand-primary/20 bg-white px-2 py-2 text-sm font-normal text-brand-text"
            defaultValue={sp.get('city') ?? 'all'}
            disabled={pending}
            onChange={(e) => setParam('city', e.target.value)}
          >
            <option value="all">Todas</option>
            {props.cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-brand-muted">
          Palabra clave
          <input
            type="search"
            className="rounded-md border border-brand-primary/20 px-2 py-2 text-sm"
            placeholder="Buscar…"
            defaultValue={sp.get('q') ?? ''}
            disabled={pending}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setParam('q', (e.target as HTMLInputElement).value);
              }
            }}
          />
        </label>
      </div>

      {advanced ? (
        <details className="mt-3 rounded-xl border border-brand-primary/10 bg-white p-4 text-sm">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-brand-primary">
            Más filtros (precio, superficie, dormitorios…)
          </summary>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs text-brand-muted">
              Zona / barrio (contiene)
              <input
                type="text"
                className="rounded-md border border-brand-primary/20 px-2 py-2"
                defaultValue={sp.get('zone') ?? ''}
                disabled={pending}
                onBlur={(e) => setParam('zone', e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-brand-muted">
              Precio venta mín.
              <input
                type="number"
                className="rounded-md border border-brand-primary/20 px-2 py-2"
                defaultValue={sp.get('minSale') ?? ''}
                disabled={pending}
                onBlur={(e) => setParam('minSale', e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-brand-muted">
              Precio venta máx.
              <input
                type="number"
                className="rounded-md border border-brand-primary/20 px-2 py-2"
                defaultValue={sp.get('maxSale') ?? ''}
                disabled={pending}
                onBlur={(e) => setParam('maxSale', e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-brand-muted">
              Dormitorios mín.
              <input
                type="number"
                min={0}
                className="rounded-md border border-brand-primary/20 px-2 py-2"
                defaultValue={sp.get('beds') ?? ''}
                disabled={pending}
                onBlur={(e) => setParam('beds', e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-brand-muted">
              Baños mín.
              <input
                type="number"
                min={0}
                className="rounded-md border border-brand-primary/20 px-2 py-2"
                defaultValue={sp.get('baths') ?? ''}
                disabled={pending}
                onBlur={(e) => setParam('baths', e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-brand-muted">
              Superficie mín. m²
              <input
                type="number"
                min={0}
                className="rounded-md border border-brand-primary/20 px-2 py-2"
                defaultValue={sp.get('minM2') ?? ''}
                disabled={pending}
                onBlur={(e) => setParam('minM2', e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-brand-muted">
              Superficie máx. m²
              <input
                type="number"
                min={0}
                className="rounded-md border border-brand-primary/20 px-2 py-2"
                defaultValue={sp.get('maxM2') ?? ''}
                disabled={pending}
                onBlur={(e) => setParam('maxM2', e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 pt-6 text-xs text-brand-muted">
              <input
                type="checkbox"
                defaultChecked={sp.get('parking') === '1'}
                disabled={pending}
                onChange={(e) => setParam('parking', e.target.checked ? '1' : '')}
              />
              Con cochera
            </label>
            <label className="flex items-center gap-2 pt-6 text-xs text-brand-muted">
              <input
                type="checkbox"
                defaultChecked={sp.get('credit') === '1'}
                disabled={pending}
                onChange={(e) => setParam('credit', e.target.checked ? '1' : '')}
              />
              Apto crédito
            </label>
          </div>
        </details>
      ) : null}
    </div>
  );
}
