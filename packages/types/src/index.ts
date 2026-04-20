/** Marca / sitio */
export type SiteType = 'avalon' | 'premier';

/** Agencia en payload Kiteprop */
export interface RawAgency {
  id: number;
  name: string;
}

/** Agente en payload Kiteprop */
export interface RawAgent {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  phone_whatsapp: string | null;
  avatar: string | null;
}

/** Imagen en payload */
export interface RawPropertyImage {
  url: string;
  title: string;
}

/**
 * Propiedad tal como llega del JSON de difusión Kiteprop.
 * Incluye claves opcionales futuras (tags, premier) para adaptación sin romper tipos.
 */
export interface RawProperty {
  id: number;
  last_update: string;
  status: string;
  url: string;
  title: string;
  content: string;
  address: string;
  city: string;
  country: string;
  region: string;
  zone: string;
  zone_2: string;
  postcode: string | null;
  latitude: string;
  longitude: string;
  hide_exact_location: boolean;
  property_type: string;
  property_type_old: string;
  rooms: number;
  total_rooms: number;
  bedrooms: number;
  bathrooms: number;
  half_bathrooms: number | null;
  floor_number: string;
  floors_in_building: number;
  total_meters: string;
  covered_meters: string | null;
  uncovered_meters: number;
  front_meters: string;
  side_meters: number;
  terrain_width: string;
  terrain_height: number;
  terrain_size: number;
  parkings: number;
  for_sale: boolean;
  for_sale_price: string;
  for_rent: boolean;
  for_rent_price: string;
  for_temp_rental: boolean;
  for_temp_rental_price_day: string;
  for_temp_rental_price_week: string;
  for_temp_rental_price_month: string;
  currency: string;
  hide_prices: boolean;
  expenses: string | null;
  year_built: number | null;
  delivery_date: string | null;
  is_new_construction: boolean | null;
  accept_barter: boolean | null;
  accept_pets: boolean | null;
  fit_for_credit: boolean | null;
  sleeps_count: number | null;
  images: RawPropertyImage[];
  link_youtube: string | null;
  link_360_iframe: string | null;
  agency: RawAgency;
  agent: RawAgent;
  /** Puede existir en futuras versiones del export / API */
  tags?: unknown;
  labels?: unknown;
  categories?: unknown;
  premier?: boolean;
  is_premier?: boolean;
}

export interface PropertyLocation {
  address: string;
  city: string;
  region: string;
  country: string;
  zone: string;
  zoneSecondary: string;
  postcode: string | null;
  latitude: number | null;
  longitude: number | null;
  hideExactLocation: boolean;
}

export type AmenityGroup =
  | 'confort'
  | 'exteriores'
  | 'seguridad'
  | 'edificio'
  | 'premium'
  | 'servicios'
  | 'operacion';

export interface PropertyAmenity {
  id: string;
  label: string;
  group: AmenityGroup;
}

export interface PropertyMediaImage {
  url: string;
  alt: string;
}

export interface PropertyMedia {
  images: PropertyMediaImage[];
  youtubeUrl: string | null;
  tour360Html: string | null;
}

export interface NormalizedProperty {
  id: number;
  slug: string;
  canonicalUrl: string;
  title: string;
  descriptionHtml: string;
  plainDescription: string;
  status: string;
  lastUpdate: string;
  propertyType: string;
  propertyTypeLabel: string;
  operation: {
    forSale: boolean;
    forRent: boolean;
    forTempRental: boolean;
    salePrice: string | null;
    rentPrice: string | null;
    tempPrices: {
      day: string | null;
      week: string | null;
      month: string | null;
    };
    currency: string;
    hidePrices: boolean;
  };
  rooms: {
    totalRooms: number;
    bedrooms: number;
    bathrooms: number;
    halfBathrooms: number | null;
  };
  surfaces: {
    totalM2: string | null;
    coveredM2: string | null;
    uncoveredM2: number | null;
    frontM: string | null;
  };
  building: {
    floor: string;
    floorsInBuilding: number;
    parkings: number;
    yearBuilt: number | null;
  };
  location: PropertyLocation;
  media: PropertyMedia;
  amenities: PropertyAmenity[];
  agent: RawAgent;
  agency: RawAgency;
  /** true si el payload o overrides marcan Premier */
  isPremier: boolean;
  /**
   * Señales editoriales normalizadas para orden y módulos curados.
   * `priorityRank`: menor = más prioridad (A=1, B=2, ...).
   */
  editorial: {
    isFeatured: boolean;
    priorityRank: number | null;
  };
}

export interface SiteBrandConfig {
  site: SiteType;
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  contact: {
    professionalName: string;
    licenseId: string;
    phoneDisplay: string;
    phoneTel: string;
    whatsapp?: string;
  };
  urls: {
    base: string;
    peerSite: string;
    peerLabel: string;
    peerCta: string;
  };
  ogImage: string;
}
