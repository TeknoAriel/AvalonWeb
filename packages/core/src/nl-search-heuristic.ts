import type { PropertyListFilters } from './filters';

export type NaturalSearchInterpretation = {
  filters: PropertyListFilters;
  /** Frases cortas de lo interpretado (para mostrar al usuario) */
  understood: string[];
};

/**
 * Intérprete local sin MCP: extrae señales simples (dormitorios, cochera, crédito, ciudad conocida).
 * Complementa filtros manuales; si el MCP está disponible vía API, puede refinarse en servidor.
 */
export function interpretNaturalPropertySearch(
  qRaw: string,
  options?: { cities?: string[] },
): NaturalSearchInterpretation {
  const q = qRaw.trim().toLowerCase();
  const understood: string[] = [];
  const filters: PropertyListFilters = {};

  if (!q) return { filters, understood };

  const dormMatch = q.match(/(\d+)\s*(dorm|hab|habitaci[oó]n|amb)/i);
  if (dormMatch) {
    const n = Number.parseInt(dormMatch[1]!, 10);
    if (Number.isFinite(n) && n > 0) {
      filters.minBedrooms = n;
      understood.push(`${n}+ dormitorios`);
    }
  }

  if (/\bcochera|garage|estacionamiento\b/i.test(qRaw)) {
    filters.hasParking = true;
    understood.push('Con cochera');
  }

  if (/\bcr[eé]dito|hipotecario|banco\b/i.test(qRaw)) {
    filters.fitCredit = true;
    understood.push('Apto crédito');
  }

  if (/\bcasa\b/.test(q) && !filters.propertyType) {
    filters.propertyType = 'houses';
    understood.push('Tipo: casas');
  } else if (/\b(depto|departamento|apto|apartamento)\b/.test(q)) {
    filters.propertyType = 'apartments';
    understood.push('Tipo: departamentos');
  }

  if (/\b(venta|comprar|compra)\b/.test(q)) {
    filters.operation = 'sale';
    understood.push('Operación: venta');
  } else if (/\b(alquiler|alquilar|renta)\b/.test(q)) {
    filters.operation = 'rent';
    understood.push('Operación: alquiler');
  }

  const cities = options?.cities ?? [];
  for (const c of cities) {
    if (!c) continue;
    if (q.includes(c.toLowerCase())) {
      filters.city = c;
      understood.push(`Ciudad: ${c}`);
      break;
    }
  }

  const priceK = q.match(/(?:hasta|m[aá]ximo|max)\s*([\d.]+)\s*(mil|k)?/i);
  if (priceK) {
    let v = Number.parseFloat(priceK[1]!.replace(/\./g, ''));
    if (Number.isFinite(v) && v > 0) {
      if (/mil|k/.test(priceK[0] ?? '')) v *= 1000;
      filters.maxSalePrice = v;
      understood.push(`Precio venta hasta ~${v.toLocaleString('es-AR')}`);
    }
  }

  const priceFrom = q.match(/(?:desde|m[ií]nimo|min)\s*([\d.]+)\s*(mil|k)?/i);
  if (priceFrom) {
    let v = Number.parseFloat(priceFrom[1]!.replace(/\./g, ''));
    if (Number.isFinite(v) && v > 0) {
      if (/mil|k/.test(priceFrom[0] ?? '')) v *= 1000;
      filters.minSalePrice = v;
      understood.push(`Precio venta desde ~${v.toLocaleString('es-AR')}`);
    }
  }

  return { filters, understood };
}
