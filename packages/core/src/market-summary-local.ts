import type { NormalizedProperty } from '@avalon/types';
import { parseListingSalePriceAmount, pricePerM2 } from './property-metrics';

export type MarketSummaryLocal = {
  sampleSize: number;
  city: string;
  /** Mediana aproximada precio/m² venta (solo propiedades con ambos datos) */
  medianPricePerM2: number | null;
  /** Posición relativa de una propiedad: low | mid | high | unknown */
  bucketForProperty: (p: NormalizedProperty) => 'low' | 'mid' | 'high' | 'unknown';
};

export function buildMarketSummaryForCity(
  city: string,
  siteList: NormalizedProperty[],
): MarketSummaryLocal {
  const inCity = siteList.filter(
    (p) => p.location.city === city && p.operation.forSale && parseListingSalePriceAmount(p) != null,
  );
  const ppm = inCity
    .map((p) => pricePerM2(p))
    .filter((x): x is number => x != null && x > 0)
    .sort((a, b) => a - b);
  const median =
    ppm.length === 0
      ? null
      : ppm.length % 2 === 1
        ? ppm[(ppm.length - 1) / 2]!
        : (ppm[ppm.length / 2 - 1]! + ppm[ppm.length / 2]!) / 2;

  const bucketForProperty = (p: NormalizedProperty): 'low' | 'mid' | 'high' | 'unknown' => {
    const v = pricePerM2(p);
    if (median == null || v == null) return 'unknown';
    if (v < median * 0.9) return 'low';
    if (v > median * 1.1) return 'high';
    return 'mid';
  };

  return {
    sampleSize: ppm.length,
    city,
    medianPricePerM2: median,
    bucketForProperty,
  };
}
