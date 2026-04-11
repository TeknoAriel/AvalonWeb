'use client';

import type { NormalizedProperty, SiteType } from '@avalon/types';
import { cn, formatMoneyAmount } from '@avalon/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  clearCompareIds,
  COMPARE_CHANGE_EVENT,
  readCompareIds,
  removeCompareId,
} from './compare-storage';

function priceSummaryPlain(p: NormalizedProperty): string {
  if (p.operation.hidePrices) return 'Consultar';
  const parts: string[] = [];
  const { operation: o } = p;
  if (o.forSale && o.salePrice) {
    const f = formatMoneyAmount(o.salePrice, o.currency);
    if (f) parts.push(`Venta ${f}`);
  }
  if (o.forRent && o.rentPrice) {
    const f = formatMoneyAmount(o.rentPrice, o.currency);
    if (f) parts.push(`Alq. ${f}`);
  }
  if (o.forTempRental) {
    const m = formatMoneyAmount(o.tempPrices.month ?? null, o.currency);
    if (m) parts.push(`Temp. ${m}`);
  }
  return parts.join(' · ') || 'Consultar';
}

function operationLabel(p: NormalizedProperty): string {
  const x: string[] = [];
  if (p.operation.forSale) x.push('Venta');
  if (p.operation.forRent) x.push('Alquiler');
  if (p.operation.forTempRental) x.push('Temporal');
  return x.join(', ') || '—';
}

export interface PropertyCompareViewProps {
  properties: NormalizedProperty[];
  site: SiteType;
  variant: 'avalon' | 'premier';
  /** ej. `/propiedades` */
  propertyPathPrefix: string;
}

export function PropertyCompareView({
  properties,
  site,
  variant,
  propertyPathPrefix,
}: PropertyCompareViewProps) {
  const [ids, setIds] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIds(readCompareIds(site));
    const onChange = (e: Event) => {
      const ce = e as CustomEvent<{ site: SiteType }>;
      if (ce.detail?.site === site) setIds(readCompareIds(site));
    };
    window.addEventListener(COMPARE_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(COMPARE_CHANGE_EVENT, onChange);
  }, [site]);

  const selected = useMemo(() => {
    const map = new Map(properties.map((p) => [p.id, p]));
    return ids.map((id) => map.get(id)).filter((p): p is NormalizedProperty => Boolean(p));
  }, [ids, properties]);

  if (!mounted) {
    return (
      <p className={variant === 'avalon' ? 'text-brand-muted' : 'text-brand-text/60'}>
        Cargando comparación…
      </p>
    );
  }

  if (selected.length === 0) {
    return (
      <div className="space-y-4">
        <p className={variant === 'avalon' ? 'text-brand-muted' : 'text-brand-text/65'}>
          No hay propiedades seleccionadas. Elegí hasta 5 desde el listado con el botón «Comparar».
        </p>
        <Link
          href={propertyPathPrefix}
          className={
            variant === 'avalon'
              ? 'inline-block text-sm font-semibold text-brand-primary underline'
              : 'inline-block text-xs uppercase tracking-caps text-brand-accent'
          }
        >
          Ir al listado
        </Link>
      </div>
    );
  }

  const cellBase =
    variant === 'avalon'
      ? 'border border-brand-primary/10 px-3 py-2 text-sm text-brand-muted align-top'
      : 'border border-brand-accent/15 px-3 py-2 text-sm text-brand-text/80 align-top';

  const thBase =
    variant === 'avalon'
      ? 'border border-brand-primary/15 bg-brand-surface-alt px-3 py-2 text-left text-xs font-semibold text-brand-primary align-top'
      : 'border border-brand-accent/20 bg-brand-surface-alt/60 px-3 py-2 text-left text-[10px] font-medium uppercase tracking-caps text-brand-primary align-top';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className={variant === 'avalon' ? 'text-sm text-brand-muted' : 'text-sm text-brand-text/65'}>
          Comparando {selected.length} de 5 propiedades
        </p>
        <button
          type="button"
          onClick={() => {
            clearCompareIds(site);
            setIds([]);
          }}
          className={
            variant === 'avalon'
              ? 'text-sm font-semibold text-brand-primary-mid underline'
              : 'text-xs uppercase tracking-caps text-brand-accent'
          }
        >
          Vaciar lista
        </button>
      </div>

      <div className="-mx-4 overflow-x-auto md:mx-0">
        <table className={cn('w-full min-w-[640px] border-collapse md:min-w-0', variant === 'premier' && 'border-brand-accent/10')}>
          <thead>
            <tr>
              <th className={thBase}>Característica</th>
              {selected.map((p) => (
                <th key={p.id} className={cn(thBase, 'min-w-[140px] max-w-[220px]')}>
                  <span className="line-clamp-3 font-normal normal-case">{p.title}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={cn(cellBase, 'font-medium text-brand-primary')}>Foto</td>
              {selected.map((p) => {
                const img = p.media.images[0];
                return (
                  <td key={p.id} className={cellBase}>
                    {img ? (
                      <Link
                        href={`${propertyPathPrefix}/${p.slug}`}
                        className="relative block h-24 w-32 overflow-hidden rounded-md"
                      >
                        <Image
                          src={img.url}
                          alt={img.alt}
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className={cn(cellBase, 'font-medium text-brand-primary')}>Enlace</td>
              {selected.map((p) => (
                <td key={p.id} className={cellBase}>
                  <Link
                    href={`${propertyPathPrefix}/${p.slug}`}
                    className={
                      variant === 'avalon'
                        ? 'font-semibold text-brand-primary-mid underline'
                        : 'border-b border-brand-accent/40 text-brand-accent'
                    }
                  >
                    Ver ficha
                  </Link>
                </td>
              ))}
            </tr>
            <tr>
              <td className={cn(cellBase, 'font-medium text-brand-primary')}>Operación</td>
              {selected.map((p) => (
                <td key={p.id} className={cellBase}>
                  {operationLabel(p)}
                </td>
              ))}
            </tr>
            <tr>
              <td className={cn(cellBase, 'font-medium text-brand-primary')}>Precio</td>
              {selected.map((p) => (
                <td key={p.id} className={cellBase}>
                  {priceSummaryPlain(p)}
                </td>
              ))}
            </tr>
            <tr>
              <td className={cn(cellBase, 'font-medium text-brand-primary')}>Ubicación</td>
              {selected.map((p) => (
                <td key={p.id} className={cellBase}>
                  {[p.location.zone, p.location.city].filter(Boolean).join(' · ')}
                </td>
              ))}
            </tr>
            <tr>
              <td className={cn(cellBase, 'font-medium text-brand-primary')}>Tipo</td>
              {selected.map((p) => (
                <td key={p.id} className={cellBase}>
                  {p.propertyTypeLabel}
                </td>
              ))}
            </tr>
            <tr>
              <td className={cn(cellBase, 'font-medium text-brand-primary')}>Ambientes</td>
              {selected.map((p) => (
                <td key={p.id} className={cellBase}>
                  {p.rooms.totalRooms || '—'}
                </td>
              ))}
            </tr>
            <tr>
              <td className={cn(cellBase, 'font-medium text-brand-primary')}>Dormitorios</td>
              {selected.map((p) => (
                <td key={p.id} className={cellBase}>
                  {p.rooms.bedrooms}
                </td>
              ))}
            </tr>
            <tr>
              <td className={cn(cellBase, 'font-medium text-brand-primary')}>Baños</td>
              {selected.map((p) => (
                <td key={p.id} className={cellBase}>
                  {p.rooms.bathrooms}
                </td>
              ))}
            </tr>
            <tr>
              <td className={cn(cellBase, 'font-medium text-brand-primary')}>Superficie</td>
              {selected.map((p) => (
                <td key={p.id} className={cellBase}>
                  {[
                    p.surfaces.coveredM2 && `Cub. ${p.surfaces.coveredM2} m²`,
                    p.surfaces.totalM2 && `Tot. ${p.surfaces.totalM2} m²`,
                  ]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </td>
              ))}
            </tr>
            <tr>
              <td className={cn(cellBase, 'font-medium text-brand-primary')}>Cocheras</td>
              {selected.map((p) => (
                <td key={p.id} className={cellBase}>
                  {p.building.parkings}
                </td>
              ))}
            </tr>
            <tr>
              <td className={cn(cellBase, 'font-medium text-brand-primary')}>Antigüedad</td>
              {selected.map((p) => (
                <td key={p.id} className={cellBase}>
                  {p.building.yearBuilt ?? '—'}
                </td>
              ))}
            </tr>
            <tr>
              <td className={cn(cellBase, 'font-medium text-brand-primary')}>Quitar</td>
              {selected.map((p) => (
                <td key={p.id} className={cellBase}>
                  <button
                    type="button"
                    onClick={() => {
                      removeCompareId(site, p.id);
                      setIds(readCompareIds(site));
                    }}
                    className="text-red-600 underline"
                  >
                    Quitar
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
