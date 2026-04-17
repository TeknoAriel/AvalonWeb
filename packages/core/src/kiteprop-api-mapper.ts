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

/** Flags `premier` / `is_premier` en API: tinyint ≠ 0 debe contar como true (no solo 1). */
function coalescePremierApiFlag(...vals: unknown[]): boolean | undefined {
  for (const v of vals) {
    if (v === undefined || v === null) continue;
    if (v === true) return true;
    if (v === false) return false;
    if (typeof v === 'number' && Number.isFinite(v)) {
      if (v === 0) return false;
      return true;
    }
    if (typeof v === 'string') {
      const s = v.trim().toLowerCase();
      if (['1', 'true', 'yes', 'y', 'on', 'si', 'sí'].includes(s)) return true;
      if (['0', 'false', 'no', 'off'].includes(s)) return false;
    }
  }
  return undefined;
}

/** Algunos tenants mandan `premier` dentro de `attributes`, `meta`, etc. */
export function nestedRecordPremierCandidates(p: Record<string, unknown>): unknown[] {
  const keys = ['attributes', 'meta', 'settings', 'publication', 'metrics'] as const;
  const out: unknown[] = [];
  for (const k of keys) {
    const v = p[k];
    if (!v || typeof v !== 'object' || Array.isArray(v)) continue;
    const r = v as Record<string, unknown>;
    out.push(r.premier, r.is_premier, r.isPremier, r.avalon_premier, r['premier_flag']);
  }
  return out;
}

function isEmptyFeedShard(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (Array.isArray(v) && v.length === 0) return true;
  if (typeof v === 'string' && v.trim() === '') return true;
  return false;
}

/** Claves donde KiteProp suele colgar etiquetas (API, export, difusiones). Alineado con heurísticas en `premier.ts`. */
export const KITEPROP_TAG_FIELD_ALIASES = [
  'tags',
  'property_tags',
  'kp_tags',
  'tag_list',
  'tag_names',
  'difusion_tags',
  'web_tags',
  'public_tags',
  'featured_tags',
] as const;

const KITEPROP_LABEL_FIELD_ALIASES = ['labels', 'label_list'] as const;
const KITEPROP_CATEGORY_FIELD_ALIASES = ['categories', 'collections', 'groups'] as const;

/**
 * El export JSON suele llevar `tags: ["premier"]`. La API a veces manda `tags: []` o `""` y el dato útil
 * está en `property_tags` / alias. `??` no sustituye arrays vacíos; por eso se elige el primer campo con contenido.
 */
function pickFirstNonEmpty(p: Record<string, unknown>, keys: readonly string[]): unknown {
  for (const key of keys) {
    const v = p[key];
    if (v === undefined || v === null) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    return v;
  }
  return undefined;
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
    tags: pickFirstNonEmpty(p, KITEPROP_TAG_FIELD_ALIASES),
    labels: pickFirstNonEmpty(p, KITEPROP_LABEL_FIELD_ALIASES),
    categories: pickFirstNonEmpty(p, KITEPROP_CATEGORY_FIELD_ALIASES),
    premier: coalescePremierApiFlag(
      p.premier,
      p.avalon_premier,
      p['premier_flag'],
      ...nestedRecordPremierCandidates(p),
    ),
    is_premier: coalescePremierApiFlag(p.is_premier, p.isPremier, ...nestedRecordPremierCandidates(p)),
  };

  return raw;
}

/**
 * Completa `tags`/`labels`/`categories` y flags Premier desde alias típicos del CRM cuando el export
 * trae `tags: []` u omite el campo pero el dato vive en otra clave del mismo objeto.
 *
 * @param sourceRow Fila original del JSON/API **antes** de `mapKitepropApiV1PropertyToRaw`. Si el mapper
 *   no copia claves extra, igual podemos leer `property_tags` / `difusion_tags` desde acá (evita perder Premier).
 */
export function enrichRawPropertyFromKitepropAliases(
  raw: RawProperty,
  sourceRow?: Record<string, unknown>,
): RawProperty {
  const rawRec = raw as unknown as Record<string, unknown>;
  const src = sourceRow ?? rawRec;
  const next: RawProperty = { ...raw };

  if (isEmptyFeedShard(raw.tags)) {
    const t = pickFirstNonEmpty(src, KITEPROP_TAG_FIELD_ALIASES);
    if (t !== undefined) next.tags = t as RawProperty['tags'];
  }
  if (isEmptyFeedShard(raw.labels)) {
    const t = pickFirstNonEmpty(src, KITEPROP_LABEL_FIELD_ALIASES);
    if (t !== undefined) next.labels = t as RawProperty['labels'];
  }
  if (isEmptyFeedShard(raw.categories)) {
    const t = pickFirstNonEmpty(src, KITEPROP_CATEGORY_FIELD_ALIASES);
    if (t !== undefined) next.categories = t as RawProperty['categories'];
  }

  if (raw.premier === undefined) {
    const b = coalescePremierApiFlag(
      src.premier,
      src.avalon_premier,
      src['premier_flag'],
      ...nestedRecordPremierCandidates(src),
    );
    if (b !== undefined) next.premier = b;
  }
  if (raw.is_premier === undefined) {
    const b = coalescePremierApiFlag(src.is_premier, src.isPremier, ...nestedRecordPremierCandidates(src));
    if (b !== undefined) next.is_premier = b;
  }

  return next;
}
