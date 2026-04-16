import type { NormalizedProperty } from '@avalon/types';
import { hasAmenity, parseListingSalePriceAmount, parseTotalM2, pricePerM2 } from './property-metrics';
import { formatMoneyAmount } from '@avalon/utils';

/**
 * Respuestas breves sin LLM (fallback si MCP / bridge no está).
 */
export function buildLocalPropertyQaAnswer(property: NormalizedProperty, questionRaw: string): string {
  const q = questionRaw.trim().toLowerCase();
  if (!q) return 'Escribí una pregunta sobre esta propiedad.';

  if (/resumen|^resum/i.test(q)) {
    const lead = property.plainDescription.slice(0, 420).trim();
    return `${property.title}. ${lead}${property.plainDescription.length > 420 ? '…' : ''}`;
  }

  if (/destac|qué tiene|amenities|caracter[ií]sticas/i.test(q)) {
    if (property.amenities.length === 0) {
      return 'En los datos estructurados no figuran amenities; revisá la descripción y las fotos. Podés pedirnos detalle por consulta.';
    }
    const top = property.amenities.slice(0, 6).map((a) => a.label);
    return `Destacamos: ${top.join(', ')}${property.amenities.length > 6 ? '…' : '.'}`;
  }

  if (/precio|cuánto|cuesta/i.test(q)) {
    if (property.operation.hidePrices) {
      return 'El precio está oculto en el aviso; te lo informamos por consulta o WhatsApp.';
    }
    const parts: string[] = [];
    if (property.operation.forSale && property.operation.salePrice) {
      const f = formatMoneyAmount(property.operation.salePrice, property.operation.currency);
      if (f) parts.push(`Venta: ${f}`);
    }
    if (property.operation.forRent && property.operation.rentPrice) {
      const f = formatMoneyAmount(property.operation.rentPrice, property.operation.currency);
      if (f) parts.push(`Alquiler: ${f}`);
    }
    return parts.length ? parts.join('. ') + '.' : 'Consultá precio con un asesor.';
  }

  if (/m²|metros|superficie/i.test(q)) {
    const t = parseTotalM2(property);
    const c = property.surfaces.coveredM2;
    const bits = [
      t != null ? `Total aprox. ${t} m²` : null,
      c ? `Cubierta ${c} m²` : null,
    ].filter(Boolean);
    return bits.length ? bits.join('. ') + '.' : 'No hay superficie detallada en el feed.';
  }

  if (/invers|renta|rendimiento/i.test(q)) {
    const ppm = pricePerM2(property);
    if (ppm == null) {
      return 'No alcanzamos a estimar relación precio/m² con los datos actuales. Un asesor puede orientarte sobre perfil de inversión.';
    }
    return `Referencia aproximada: precio por m² de venta ~ ${Math.round(ppm).toLocaleString('es-AR')} (moneda del aviso). La decisión de inversión conviene validarla con un asesor.`;
  }

  if (/cochera|estaciona/i.test(q)) {
    return property.building.parkings > 0
      ? `Indica ${property.building.parkings} cochera(s).`
      : 'Según el feed no registra cochera; verificá en la descripción o consultanos.';
  }

  if (/cr[eé]dito/i.test(q)) {
    return hasAmenity(property, 'credit')
      ? 'Figura como apta crédito en los datos estructurados (sujeto a validación bancaria).'
      : 'No consta “apto crédito” en los datos estructurados; puede igualmente aplicar — consultá.';
  }

  return 'Con esa pregunta lo mejor es que un asesor te responda con precisión. Podés enviar la consulta abajo o por WhatsApp.';
}
