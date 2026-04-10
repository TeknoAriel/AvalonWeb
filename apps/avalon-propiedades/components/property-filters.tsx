'use client';

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

  const setParam = useCallback(
    (key: string, value: string) => {
      start(() => {
        const next = new URLSearchParams(sp.toString());
        if (!value || value === 'all') next.delete(key);
        else next.set(key, value);
        router.push(`?${next.toString()}`);
      });
    },
    [router, sp]
  );

  return (
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
  );
}
