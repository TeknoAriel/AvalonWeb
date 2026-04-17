import type { RawProperty } from '@avalon/types';
import { enrichRawPropertyFromKitepropAliases, mapKitepropApiV1PropertyToRaw } from './kiteprop-api-mapper';

/** Extrae filas de propiedad de un JSON de listado (array raíz, `{ data: [] }` o `data.data`). */
export function extractKitepropPropertyFeedRows(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (payload && typeof payload === 'object') {
    const o = payload as Record<string, unknown>;
    if (Array.isArray(o.data)) return o.data as Record<string, unknown>[];
    if (Array.isArray(o.properties)) return o.properties as Record<string, unknown>[];
    const inner = o.data;
    if (inner && typeof inner === 'object' && Array.isArray((inner as Record<string, unknown>).data)) {
      return (inner as Record<string, unknown>).data as Record<string, unknown>[];
    }
  }
  return [];
}

function rowLooksLikeKitepropApiV1Property(row: Record<string, unknown>): boolean {
  if (row.images_list != null) return true;
  if (typeof row.updated_at === 'string' && row.last_update == null) return true;
  return false;
}

/**
 * Normaliza el cuerpo JSON de un dump (p. ej. respuesta API o export) a `RawProperty[]`. El catálogo en runtime no usa URL de difusión; se mantiene para tests / herramientas.
 * Las filas con forma API v1 pasan por `mapKitepropApiV1PropertyToRaw` (tags vacíos + alias `property_tags`, etc.).
 * El export plano tipo `properties.json` se usa tal cual si no coincide la heurística API.
 */
export function parseKitepropPropertyFeedJsonPayload(payload: unknown): RawProperty[] {
  const rows = extractKitepropPropertyFeedRows(payload);
  const out: RawProperty[] = [];
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const base = rowLooksLikeKitepropApiV1Property(r)
      ? mapKitepropApiV1PropertyToRaw(r)
      : (r as unknown as RawProperty);
    if (!base?.id) continue;
    out.push(enrichRawPropertyFromKitepropAliases(base, r));
  }
  return out;
}
