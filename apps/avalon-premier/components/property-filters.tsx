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
    <div className="grid gap-4 border border-brand-accent/15 bg-brand-surface-alt/30 p-6 md:grid-cols-4">
      <label className="flex flex-col gap-2 text-[10px] font-medium uppercase tracking-caps text-brand-text/60">
        Operación
        <select
          className="border-b border-brand-primary/20 bg-transparent py-2 text-sm font-normal text-brand-text"
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
      <label className="flex flex-col gap-2 text-[10px] font-medium uppercase tracking-caps text-brand-text/60">
        Tipo
        <select
          className="border-b border-brand-primary/20 bg-transparent py-2 text-sm font-normal text-brand-text"
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
      <label className="flex flex-col gap-2 text-[10px] font-medium uppercase tracking-caps text-brand-text/60">
        Ciudad
        <select
          className="border-b border-brand-primary/20 bg-transparent py-2 text-sm font-normal text-brand-text"
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
      <label className="flex flex-col gap-2 text-[10px] font-medium uppercase tracking-caps text-brand-text/60">
        Palabra clave
        <input
          type="search"
          className="border-b border-brand-primary/20 bg-transparent py-2 text-sm outline-none"
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
