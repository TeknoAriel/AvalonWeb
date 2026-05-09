import type { NormalizedProperty } from '@avalon/types';
import { parseListingRentAmount, parseListingSalePriceAmount, parseTotalM2 } from './property-metrics';

export type PropertyDetailSeo = {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImageUrl: string | null;
};

export function getPropertyDetailSeo(
  property: NormalizedProperty,
  listingPageAbsoluteUrl: string,
): PropertyDetailSeo {
  return {
    title: property.title,
    description: property.plainDescription.slice(0, 160),
    canonicalUrl: listingPageAbsoluteUrl,
    ogImageUrl: property.media.images[0]?.url ?? null,
  };
}

function iso4217(currency: string | undefined): string {
  const raw = (currency ?? '').trim();
  const c = raw.toUpperCase();
  if (/USD|U\$S|U\.S\.?\s*D/.test(c)) return 'USD';
  if (c.length === 3 && /^[A-Z]{3}$/.test(c)) return c;
  return 'ARS';
}

function primaryOffer(property: NormalizedProperty): Record<string, unknown> | null {
  if (property.operation.hidePrices) return null;
  const currency = iso4217(property.operation.currency);
  const sale = parseListingSalePriceAmount(property);
  if (sale != null && property.operation.forSale) {
    return {
      '@type': 'Offer',
      price: sale,
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
      url: property.canonicalUrl || undefined,
    };
  }
  const rent = parseListingRentAmount(property);
  if (rent != null && property.operation.forRent) {
    return {
      '@type': 'Offer',
      price: rent,
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
      url: property.canonicalUrl || undefined,
    };
  }
  return null;
}

/**
 * JSON-LD para fichas de propiedad (Schema.org RealEstateListing).
 */
export function buildRealEstateListingJsonLd(
  property: NormalizedProperty,
  listingPageUrl: string,
  providerName: string,
): Record<string, unknown> {
  const images = property.media.images.map((img) => img.url).filter(Boolean);
  const offer = primaryOffer(property);
  const totalM2 = parseTotalM2(property);

  const json: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.plainDescription.slice(0, 8000),
    url: listingPageUrl,
  };

  if (images.length === 1) json.image = images[0];
  else if (images.length > 1) json.image = images;

  if (offer) json.offers = offer;

  const addrParts = [
    property.location.address,
    property.location.zone,
    property.location.city,
    property.location.region,
    property.location.country,
  ].filter(Boolean);
  if (addrParts.length > 0) {
    json.address = {
      '@type': 'PostalAddress',
      streetAddress: property.location.address || undefined,
      addressLocality: property.location.city || undefined,
      addressRegion: property.location.region || undefined,
      addressCountry: property.location.country || undefined,
    };
  }

  if (
    !property.location.hideExactLocation &&
    property.location.latitude != null &&
    property.location.longitude != null
  ) {
    json.geo = {
      '@type': 'GeoCoordinates',
      latitude: property.location.latitude,
      longitude: property.location.longitude,
    };
  }

  if (totalM2 != null && totalM2 > 0) {
    json.floorSize = {
      '@type': 'QuantitativeValue',
      value: totalM2,
      unitCode: 'MTK',
    };
  }

  json.provider = {
    '@type': 'RealEstateAgent',
    name: providerName,
  };

  return json;
}
