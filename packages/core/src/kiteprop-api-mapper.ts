import type { RawAgency, RawAgent, RawProperty, RawPropertyImage } from '@avalon/types';

function str(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return String(v);
}

function num(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function bool(v: unknown): boolean {
  return v === true;
}

function mapUserToAgent(u: unknown): RawAgent {
  if (!u || typeof u !== 'object') {
    return {
      id: 0,
      name: '',
      email: null,
      phone: null,
      phone_whatsapp: null,
      avatar: null,
    };
  }
  const o = u as Record<string, unknown>;
  const id = num(o.id);
  return {
    id: Number.isFinite(id) ? id : 0,
    name: str(o.full_name || o.name || ''),
    email: o.email != null ? str(o.email) : null,
    phone: o.phone != null ? str(o.phone) : null,
    phone_whatsapp: o.phone_whatsapp != null ? str(o.phone_whatsapp) : null,
    avatar: o.avatar != null ? str(o.avatar) : null,
  };
}

const emptyAgency: RawAgency = { id: 0, name: 'Avalon' };

/**
 * Convierte un ítem de GET /api/v1/properties (documentación v1) al shape RawProperty del export/difusión.
 * Campos no presentes en la API se rellenan con valores seguros por defecto.
 */
export function mapKitepropApiV1PropertyToRaw(p: Record<string, unknown>): RawProperty | null {
  const id = num(p.id);
  if (!id) return null;

  const geo = p.geo && typeof p.geo === 'object' ? (p.geo as Record<string, unknown>) : null;
  const lat = geo?.lat != null ? str(geo.lat) : '';
  const lng = geo?.lng != null ? str(geo.lng) : '';

  const imagesList = Array.isArray(p.images_list) ? p.images_list : [];
  const images: RawPropertyImage[] = imagesList
    .map((row) => {
      if (!row || typeof row !== 'object') return null;
      const img = row as Record<string, unknown>;
      const url = str(img.lg || img.md || img.sm || '');
      if (!url) return null;
      return { url, title: img.title != null ? str(img.title) : '' };
    })
    .filter((x): x is RawPropertyImage => x != null);

  const agent = mapUserToAgent(p.assigned_user ?? p.user);

  const publicUrl =
    typeof p.public_url === 'string'
      ? p.public_url
      : typeof p.url === 'string'
        ? p.url
        : `https://www.kiteprop.com/propiedad/${id}`;

  const raw: RawProperty = {
    id,
    last_update: str(p.updated_at || p.created_at || new Date().toISOString()),
    status: str(p.status || 'active'),
    url: publicUrl,
    title: str(p.title),
    content: str(p.description || p.content || ''),
    address: str(p.address),
    city: str(p.city),
    country: str(p.country),
    region: str(p.state || p.region || ''),
    zone: str(p.zone || p.neighborhood || ''),
    zone_2: '',
    postcode: p.postal_code != null ? str(p.postal_code) : null,
    latitude: lat,
    longitude: lng,
    hide_exact_location: bool(p.hide_exact_location),
    property_type: str(p.type || p.property_type || 'apartments'),
    property_type_old: str(p.type || p.property_type || 'apartments'),
    rooms: num(p.rooms),
    total_rooms: num(p.rooms),
    bedrooms: num(p.bedrooms),
    bathrooms: num(p.bathrooms),
    half_bathrooms: p.half_bathrooms != null ? num(p.half_bathrooms) : null,
    floor_number: str(p.floor ?? p.floor_number ?? ''),
    floors_in_building: num(p.floors_in_building),
    total_meters: str(p.total_meters ?? ''),
    covered_meters: p.covered_meters != null ? str(p.covered_meters) : null,
    uncovered_meters: num(p.uncovered_meters),
    front_meters: str(p.front_meters ?? ''),
    side_meters: num(p.side_meters),
    terrain_width: str(p.front_meters ?? ''),
    terrain_height: 0,
    terrain_size: num(p.terrain_size),
    parkings: num(p.parkings),
    for_sale: bool(p.for_sale),
    for_sale_price: str(p.for_sale_price ?? ''),
    for_rent: bool(p.for_rent),
    for_rent_price: str(p.for_rent_price ?? ''),
    for_temp_rental: bool(p.for_temp_rental),
    for_temp_rental_price_day: str(p.for_temp_rental_price_day ?? ''),
    for_temp_rental_price_week: str(p.for_temp_rental_price_week ?? ''),
    for_temp_rental_price_month: str(p.for_temp_rental_price_month ?? ''),
    currency: str(p.currency || 'ARS'),
    hide_prices: bool(p.hide_prices),
    expenses: p.expenses != null ? str(p.expenses) : null,
    year_built: p.year_built != null ? num(p.year_built) : null,
    delivery_date: p.delivery_date != null ? str(p.delivery_date) : null,
    is_new_construction: p.is_new_construction === null ? null : bool(p.is_new_construction),
    accept_barter: p.accept_barter === null ? null : bool(p.accept_barter),
    accept_pets: p.accept_pets === null ? null : bool(p.accept_pets),
    fit_for_credit: p.fit_for_credit === null ? null : bool(p.fit_for_credit),
    sleeps_count: null,
    images,
    link_youtube: p.link_youtube != null ? str(p.link_youtube) : null,
    link_360_iframe: p.link_360 != null ? str(p.link_360) : null,
    agency: emptyAgency,
    agent,
    /** API v1 a veces envía tags en alias distintos al export JSON. */
    tags: p.tags ?? p.property_tags ?? p.kp_tags ?? p.tag_list ?? p.tag_names,
    labels: p.labels ?? p.label_list,
    categories: p.categories ?? p.collections,
    premier: typeof p.premier === 'boolean' ? p.premier : undefined,
    is_premier: typeof p.is_premier === 'boolean' ? p.is_premier : undefined,
  };

  return raw;
}
