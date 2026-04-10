import type { NormalizedProperty, RawProperty } from '@avalon/types';
import { stripHtml } from '@avalon/utils';
import { extractAmenities } from './amenities';
import { extractMedia } from './media';
import { hasPremierTag } from './premier';
import { propertyTypeLabel } from './property-type-labels';
import { buildPropertySlug } from './slug';

function numOrNull(s: string | null | undefined): number | null {
  if (s == null || s === '') return null;
  const n = Number.parseFloat(s);
  return Number.isNaN(n) ? null : n;
}

export function normalizeProperty(raw: RawProperty): NormalizedProperty {
  const media = extractMedia(raw);
  const amenities = extractAmenities(raw);

  return {
    id: raw.id,
    slug: buildPropertySlug(raw),
    canonicalUrl: raw.url,
    title: raw.title,
    descriptionHtml: raw.content ?? '',
    plainDescription: stripHtml(raw.content ?? ''),
    status: raw.status,
    lastUpdate: raw.last_update,
    propertyType: raw.property_type,
    propertyTypeLabel: propertyTypeLabel(raw.property_type),
    operation: {
      forSale: raw.for_sale,
      forRent: raw.for_rent,
      forTempRental: raw.for_temp_rental,
      salePrice: raw.for_sale ? raw.for_sale_price : null,
      rentPrice: raw.for_rent ? raw.for_rent_price : null,
      tempPrices: {
        day: raw.for_temp_rental ? raw.for_temp_rental_price_day : null,
        week: raw.for_temp_rental ? raw.for_temp_rental_price_week : null,
        month: raw.for_temp_rental ? raw.for_temp_rental_price_month : null,
      },
      currency: raw.currency,
      hidePrices: raw.hide_prices,
    },
    rooms: {
      totalRooms: raw.total_rooms,
      bedrooms: raw.bedrooms,
      bathrooms: raw.bathrooms,
      halfBathrooms: raw.half_bathrooms,
    },
    surfaces: {
      totalM2: raw.total_meters || null,
      coveredM2: raw.covered_meters,
      uncoveredM2: raw.uncovered_meters,
      frontM: raw.front_meters,
    },
    building: {
      floor: raw.floor_number,
      floorsInBuilding: raw.floors_in_building,
      parkings: raw.parkings,
      yearBuilt: raw.year_built,
    },
    location: {
      address: raw.address,
      city: raw.city,
      region: raw.region,
      country: raw.country,
      zone: raw.zone,
      zoneSecondary: raw.zone_2,
      postcode: raw.postcode,
      latitude: numOrNull(raw.latitude),
      longitude: numOrNull(raw.longitude),
      hideExactLocation: raw.hide_exact_location,
    },
    media,
    amenities,
    agent: raw.agent,
    agency: raw.agency,
    isPremier: hasPremierTag(raw),
  };
}
