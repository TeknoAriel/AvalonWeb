import type { NormalizedProperty } from '@avalon/types';
import {
  parseListingSalePriceAmount,
  parseTotalM2,
  parseCoveredM2,
  pricePerM2,
  hasAmenity,
} from './property-metrics';

export type CompareInsight = { id: string; label: string; detail: string };

function minBy<T>(arr: T[], score: (x: T) => number | null): T | null {
  let best: T | null = null;
  let bestScore: number | null = null;
  for (const x of arr) {
    const s = score(x);
    if (s == null) continue;
    if (bestScore == null || s < bestScore) {
      bestScore = s;
      best = x;
    }
  }
  return best;
}

function maxBy<T>(arr: T[], score: (x: T) => number | null): T | null {
  let best: T | null = null;
  let bestScore: number | null = null;
  for (const x of arr) {
    const s = score(x);
    if (s == null) continue;
    if (bestScore == null || s > bestScore) {
      bestScore = s;
      best = x;
    }
  }
  return best;
}

/** Resumen corto para ayudar a decidir sin agrandar la tabla. */
export function buildCompareInsights(selected: NormalizedProperty[]): CompareInsight[] {
  if (selected.length < 2) return [];
  const out: CompareInsight[] = [];

  const salePrices = selected.map((p) => ({ p, v: parseListingSalePriceAmount(p) }));
  const withSale = salePrices.filter((x) => x.v != null) as { p: NormalizedProperty; v: number }[];
  if (withSale.length >= 2) {
    const cheapest = minBy(withSale, (x) => x.v);
    if (cheapest) {
      out.push({
        id: 'min-price',
        label: 'Menor precio de venta',
        detail: cheapest.p.title,
      });
    }
  }

  const m2 = selected.map((p) => ({
    p,
    v: parseTotalM2(p) ?? parseCoveredM2(p),
  }));
  const withM2 = m2.filter((x) => x.v != null && x.v > 0) as { p: NormalizedProperty; v: number }[];
  if (withM2.length >= 2) {
    const largest = maxBy(withM2, (x) => x.v);
    if (largest) {
      out.push({
        id: 'max-m2',
        label: 'Mayor superficie (total o cubierta)',
        detail: `${largest.p.title} (${largest.v} m²)`,
      });
    }
  }

  const ppm = selected.map((p) => ({ p, v: pricePerM2(p) }));
  const withPpm = ppm.filter((x) => x.v != null) as { p: NormalizedProperty; v: number }[];
  if (withPpm.length >= 2) {
    const best = minBy(withPpm, (x) => x.v);
    if (best) {
      out.push({
        id: 'best-ppm2',
        label: 'Mejor precio por m² (venta)',
        detail: best.p.title,
      });
    }
  }

  const beds = selected.map((p) => ({ p, v: p.rooms.bedrooms }));
  const withBeds = beds.filter((x) => x.v > 0);
  if (withBeds.length >= 2) {
    const top = maxBy(withBeds, (x) => x.v);
    if (top) {
      out.push({
        id: 'max-bed',
        label: 'Más dormitorios',
        detail: `${top.p.title} (${top.v})`,
      });
    }
  }

  const onlyParking = selected.filter((p) => p.building.parkings > 0);
  if (onlyParking.length === 1) {
    out.push({
      id: 'only-parking',
      label: 'Única con cochera',
      detail: onlyParking[0]!.title,
    });
  }

  const onlyCredit = selected.filter((p) => hasAmenity(p, 'credit'));
  if (onlyCredit.length === 1) {
    out.push({
      id: 'only-credit',
      label: 'Única apta crédito (según datos)',
      detail: onlyCredit[0]!.title,
    });
  }

  const dedup = new Map<string, CompareInsight>();
  for (const i of out) dedup.set(i.id, i);
  return [...dedup.values()];
}
