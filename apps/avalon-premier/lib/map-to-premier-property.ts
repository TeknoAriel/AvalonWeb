import type { NormalizedProperty } from '@avalon/types';
import { formatMoneyAmount } from '@avalon/utils';
import type { PremierOperationType, PremierProperty } from '@/types/premier';

function detectOperationType(p: NormalizedProperty): PremierOperationType {
  const { forSale, forRent, forTempRental } = p.operation;
  const n = [forSale, forRent, forTempRental].filter(Boolean).length;
  if (n > 1) return 'mixed';
  if (forSale) return 'sale';
  if (forRent) return 'rent';
  if (forTempRental) return 'temp';
  return 'mixed';
}

function priceLine(p: NormalizedProperty): string {
  if (p.operation.hidePrices) return 'Consultar';
  const parts: string[] = [];
  const o = p.operation;
  if (o.forSale && o.salePrice) {
    const f = formatMoneyAmount(o.salePrice, o.currency);
    if (f) parts.push(`Venta ${f}`);
  }
  if (o.forRent && o.rentPrice) {
    const f = formatMoneyAmount(o.rentPrice, o.currency);
    if (f) parts.push(`Alquiler ${f}`);
  }
  if (o.forTempRental) {
    const m = formatMoneyAmount(o.tempPrices.month ?? null, o.currency);
    if (m) parts.push(`Temporal ${m}`);
  }
  return parts.join(' · ') || 'Consultar';
}

export function toPremierProperty(p: NormalizedProperty): PremierProperty {
  const vids: PremierProperty['videos'] = [];
  if (p.media.youtubeUrl) {
    vids.push({ type: 'youtube', url: p.media.youtubeUrl });
  }

  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    operationType: detectOperationType(p),
    propertyType: p.propertyType,
    propertyTypeLabel: p.propertyTypeLabel,
    country: p.location.country,
    city: p.location.city,
    address: p.location.address,
    zone: p.location.zone,
    coordinates: {
      lat: p.location.latitude,
      lng: p.location.longitude,
    },
    hideExactLocation: p.location.hideExactLocation,
    priceSummary: priceLine(p),
    currency: p.operation.currency,
    hidePrices: p.operation.hidePrices,
    surfaceTotal: p.surfaces.totalM2,
    surfaceCovered: p.surfaces.coveredM2,
    bedrooms: p.rooms.bedrooms,
    bathrooms: p.rooms.bathrooms,
    totalRooms: p.rooms.totalRooms,
    amenities: p.amenities.map((a) => ({ id: a.id, label: a.label })),
    descriptionHtml: p.descriptionHtml,
    plainDescription: p.plainDescription,
    gallery: p.media.images.map((i) => ({ url: i.url, alt: i.alt })),
    videos: vids,
    tour360Html: p.media.tour360Html,
    featured: false,
    status: p.status,
    lastUpdate: p.lastUpdate,
    agent: {
      name: p.agent.name,
      email: p.agent.email,
      phone: p.agent.phone,
      phoneWhatsapp: p.agent.phone_whatsapp,
      avatar: p.agent.avatar,
    },
    isPremier: p.isPremier,
  };
}
