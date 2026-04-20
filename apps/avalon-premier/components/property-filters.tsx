'use client';

import { isFeatureEnabled } from '@avalon/config';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const advanced = isFeatureEnabled('extended_filters');

  const setParam = useCallback(
    (key: string, value: string) => {
      start(() => {
        const next = new URLSearchParams(sp.toString());
        if (!value || value === 'all') next.delete(key);
        else next.set(key, value);
        const path = pathname || '/propiedades';
        const qs = next.toString();
        router.push(qs ? `${path}?${qs}` : path);
      });
    },
    [router, pathname, sp]
  );

  return (
    <div key={sp.toString()} className="space-y-3">
    <div className="grid gap-3 border border-brand-accent/15 bg-brand-surface-alt/30 p-4 md:grid-cols-4 md:gap-4 md:p-5">
      <label className="flex flex-col gap-1.5 text-[9px] font-medium uppercase tracking-caps text-brand-text/60">
        Operación
        <select
          className="border-b border-brand-primary/20 bg-transparent py-1.5 text-sm font-normal text-brand-text"
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
      <label className="flex flex-col gap-1.5 text-[9px] font-medium uppercase tracking-caps text-brand-text/60">
        Tipo
        <select
          className="border-b border-brand-primary/20 bg-transparent py-1.5 text-sm font-normal text-brand-text"
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
      <label className="flex flex-col gap-1.5 text-[9px] font-medium uppercase tracking-caps text-brand-text/60">
        Ciudad
        <select
          className="border-b border-brand-primary/20 bg-transparent py-1.5 text-sm font-normal text-brand-text"
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
      <label className="flex flex-col gap-1.5 text-[9px] font-medium uppercase tracking-caps text-brand-text/60">
        Palabra clave
        <input
          type="search"
          className="border-b border-brand-primary/20 bg-transparent py-1.5 text-sm outline-none"
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
      <details className="border border-brand-accent/15 bg-brand-bg/40 p-3.5 text-sm md:p-4">
        <summary className="cursor-pointer text-[9px] font-medium uppercase tracking-caps text-brand-text/60">
          Más filtros
        </summary>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-caps text-brand-text/55">
            Zona
            <input
              type="text"
              className="border-b border-brand-primary/20 bg-transparent py-2 text-sm"
              defaultValue={sp.get('zone') ?? ''}
              disabled={pending}
              onBlur={(e) => setParam('zone', e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-[10px] uppercase tracking-caps text-brand-text/55">
            Precio venta mín.
            <input
              type="number"
              className="border-b border-brand-primary/20 bg-transparent py-2 text-sm"
              defaultValue={sp.get('minSale') ?? ''}
              disabled={pending}
              onBlur={(e) => setParam('minSale', e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-[10px] uppercase tracking-caps text-brand-text/55">
            Precio venta máx.
            <input
              type="number"
              className="border-b border-brand-primary/20 bg-transparent py-2 text-sm"
              defaultValue={sp.get('maxSale') ?? ''}
              disabled={pending}
              onBlur={(e) => setParam('maxSale', e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-[10px] uppercase tracking-caps text-brand-text/55">
            Dormitorios mín.
            <input
              type="number"
              className="border-b border-brand-primary/20 bg-transparent py-2 text-sm"
              defaultValue={sp.get('beds') ?? ''}
              disabled={pending}
              onBlur={(e) => setParam('beds', e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-[10px] uppercase tracking-caps text-brand-text/55">
            Baños mín.
            <input
              type="number"
              className="border-b border-brand-primary/20 bg-transparent py-2 text-sm"
              defaultValue={sp.get('baths') ?? ''}
              disabled={pending}
              onBlur={(e) => setParam('baths', e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-[10px] uppercase tracking-caps text-brand-text/55">
            Superficie mín. m²
            <input
              type="number"
              className="border-b border-brand-primary/20 bg-transparent py-2 text-sm"
              defaultValue={sp.get('minM2') ?? ''}
              disabled={pending}
              onBlur={(e) => setParam('minM2', e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-[10px] uppercase tracking-caps text-brand-text/55">
            Superficie máx. m²
            <input
              type="number"
              className="border-b border-brand-primary/20 bg-transparent py-2 text-sm"
              defaultValue={sp.get('maxM2') ?? ''}
              disabled={pending}
              onBlur={(e) => setParam('maxM2', e.target.value)}
            />
          </label>
          <label className="flex items-center gap-2 pt-6 text-xs text-brand-text/65">
            <input
              type="checkbox"
              defaultChecked={sp.get('parking') === '1'}
              disabled={pending}
              onChange={(e) => setParam('parking', e.target.checked ? '1' : '')}
            />
            Cochera
          </label>
          <label className="flex items-center gap-2 pt-6 text-xs text-brand-text/65">
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
