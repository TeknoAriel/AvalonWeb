import type { OperationFilter, PropertyListFilters } from './filters';

/** Serializa filtros a query string compatible con las páginas de listado. */
export function propertyListFiltersToQuery(f: PropertyListFilters): string {
  const sp = new URLSearchParams();
  if (f.operation && f.operation !== 'all') sp.set('op', f.operation);
  if (f.propertyType && f.propertyType !== 'all') sp.set('type', f.propertyType);
  if (f.city && f.city !== 'all') sp.set('city', f.city);
  if (f.zone && f.zone !== 'all') sp.set('zone', f.zone);
  if (f.q && f.q.trim()) sp.set('q', f.q.trim());
  if (f.minSalePrice != null && Number.isFinite(f.minSalePrice)) sp.set('minSale', String(f.minSalePrice));
  if (f.maxSalePrice != null && Number.isFinite(f.maxSalePrice)) sp.set('maxSale', String(f.maxSalePrice));
  if (f.minBedrooms != null && Number.isFinite(f.minBedrooms)) sp.set('beds', String(f.minBedrooms));
  if (f.minBathrooms != null && Number.isFinite(f.minBathrooms)) sp.set('baths', String(f.minBathrooms));
  if (f.minTotalM2 != null && Number.isFinite(f.minTotalM2)) sp.set('minM2', String(f.minTotalM2));
  if (f.maxTotalM2 != null && Number.isFinite(f.maxTotalM2)) sp.set('maxM2', String(f.maxTotalM2));
  if (f.hasParking === true) sp.set('parking', '1');
  if (f.fitCredit === true) sp.set('credit', '1');
  return sp.toString();
}

/** Lee query plana del listado → filtros (tolerante a valores inválidos). */
export function queryToPropertyListFilters(sp: URLSearchParams): PropertyListFilters {
  const opRaw = sp.get('op');
  const typeRaw = sp.get('type');
  const cityRaw = sp.get('city');
  const zoneRaw = sp.get('zone');
  const q = sp.get('q') ?? undefined;
  const minSale = num(sp.get('minSale'));
  const maxSale = num(sp.get('maxSale'));
  const beds = int(sp.get('beds'));
  const baths = int(sp.get('baths'));
  const minM2 = num(sp.get('minM2'));
  const maxM2 = num(sp.get('maxM2'));
  const parking = sp.get('parking') === '1' ? true : undefined;
  const credit = sp.get('credit') === '1' ? true : undefined;

  const operation: OperationFilter | undefined =
    opRaw === 'sale' || opRaw === 'rent' || opRaw === 'temp' || opRaw === 'all' ? opRaw : undefined;

  return {
    operation,
    propertyType: typeRaw && typeRaw !== 'all' ? typeRaw : undefined,
    city: cityRaw && cityRaw !== 'all' ? cityRaw : undefined,
    zone: zoneRaw && zoneRaw !== 'all' ? zoneRaw : undefined,
    q,
    minSalePrice: minSale ?? undefined,
    maxSalePrice: maxSale ?? undefined,
    minBedrooms: beds ?? undefined,
    minBathrooms: baths ?? undefined,
    minTotalM2: minM2 ?? undefined,
    maxTotalM2: maxM2 ?? undefined,
    hasParking: parking,
    fitCredit: credit,
  };
}

function num(s: string | null): number | undefined {
  if (s == null || s === '') return undefined;
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : undefined;
}

function int(s: string | null): number | undefined {
  if (s == null || s === '') return undefined;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : undefined;
}
