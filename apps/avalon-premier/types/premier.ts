/**
 * Modelo de vista para UI Avalon Premier.
 * La capa de presentación no consume el payload crudo de KiteProp / JSON.
 */
export type PremierOperationType = 'sale' | 'rent' | 'temp' | 'mixed';

export interface PremierAgent {
  name: string;
  email: string | null;
  phone: string | null;
  phoneWhatsapp: string | null;
  avatar: string | null;
}

export interface PremierProperty {
  id: number;
  slug: string;
  title: string;
  operationType: PremierOperationType;
  propertyType: string;
  propertyTypeLabel: string;
  country: string;
  city: string;
  address: string;
  zone: string;
  coordinates: { lat: number | null; lng: number | null };
  hideExactLocation: boolean;
  priceSummary: string;
  currency: string;
  hidePrices: boolean;
  surfaceTotal: string | null;
  surfaceCovered: string | null;
  bedrooms: number;
  bathrooms: number;
  totalRooms: number;
  amenities: { id: string; label: string }[];
  descriptionHtml: string;
  plainDescription: string;
  gallery: { url: string; alt: string }[];
  videos: { type: 'youtube' | 'embed'; url: string }[];
  tour360Html: string | null;
  featured: boolean;
  status: string;
  lastUpdate: string;
  agent: PremierAgent;
  isPremier: boolean;
}
