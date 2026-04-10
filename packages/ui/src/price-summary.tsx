import type { NormalizedProperty } from '@avalon/types';
import { formatMoneyAmount } from '@avalon/utils';

export interface PriceSummaryProps {
  property: Pick<NormalizedProperty, 'operation'>;
  className?: string;
}

export function PriceSummary({ property, className }: PriceSummaryProps) {
  const { operation } = property;
  if (operation.hidePrices) {
    return <p className={className}>Consultar precio</p>;
  }
  const parts: string[] = [];
  if (operation.forSale && operation.salePrice) {
    const f = formatMoneyAmount(operation.salePrice, operation.currency);
    if (f) parts.push(`Venta ${f}`);
  }
  if (operation.forRent && operation.rentPrice) {
    const f = formatMoneyAmount(operation.rentPrice, operation.currency);
    if (f) parts.push(`Alquiler ${f}`);
  }
  if (operation.forTempRental) {
    const d = formatMoneyAmount(operation.tempPrices.day ?? null, operation.currency);
    const w = formatMoneyAmount(operation.tempPrices.week ?? null, operation.currency);
    const m = formatMoneyAmount(operation.tempPrices.month ?? null, operation.currency);
    const t = [d && `día ${d}`, w && `sem. ${w}`, m && `mes ${m}`].filter(Boolean).join(' · ');
    if (t) parts.push(`Temporal ${t}`);
  }
  if (parts.length === 0) {
    return <p className={className}>Consultar</p>;
  }
  return (
    <div className={className}>
      {parts.map((line) => (
        <p key={line} className="leading-snug">
          {line}
        </p>
      ))}
    </div>
  );
}
