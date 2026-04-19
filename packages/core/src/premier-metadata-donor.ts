import type { RawProperty } from '@avalon/types';
import { hasPremierTag } from './premier';

function isVirtuallyEmpty(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (Array.isArray(v) && v.length === 0) return true;
  if (typeof v === 'string' && v.trim() === '') return true;
  return false;
}

/** Si el destino trae el campo vacío y el donor tiene dato, usamos el donor (misma idea que snapshot merge). */
function preferDonorField(donorVal: unknown, recipientVal: unknown): unknown {
  if (isVirtuallyEmpty(recipientVal) && !isVirtuallyEmpty(donorVal)) return donorVal;
  return recipientVal;
}

/**
 * Campos que `hasPremierTag` puede mirar. Unificar JSON/API/snapshot al copiar desde un donor (API o snapshot).
 */
export const PREMIER_PATCH_FIELD_KEYS: readonly string[] = [
  'tags',
  'modificadores',
  'modificador',
  'modifiers',
  'labels',
  'categories',
  'premier',
  'is_premier',
  'property_tags',
  'property_tag_names',
  'tag_names',
  'tag_list',
  'kp_tags',
  'difusion_tags',
  'web_tags',
  'public_tags',
  'featured_tags',
  'groups',
  'collections',
  'saved_lists',
  'saved_list_ids',
  'lists',
  'list_ids',
  'propsheet_ids',
  'saved_filter_ids',
  'segment',
  'collection',
  'tier',
  'class',
  'tag',
  'tag_slug',
  'tier_slug',
];

/**
 * Si `recipient` no tiene señal Premier pero `donor` sí (mismo `id` en otro feed), copia campos de etiqueta/flags.
 * Usado por: (1) merge con snapshot del repo, (2) suplemento API cuando el JSON de difusión omitió Premier.
 */
export function applyPremierMetadataFromDonor(
  recipient: RawProperty,
  donor: RawProperty,
): RawProperty {
  if (hasPremierTag(recipient)) return recipient;
  if (!hasPremierTag(donor)) return recipient;

  const merged: Record<string, unknown> = { ...recipient };
  const d = donor as unknown as Record<string, unknown>;

  for (const key of PREMIER_PATCH_FIELD_KEYS) {
    merged[key] = preferDonorField(d[key], merged[key]);
  }

  let out = merged as unknown as RawProperty;
  if (!hasPremierTag(out)) {
    for (const key of PREMIER_PATCH_FIELD_KEYS) {
      const dv = d[key];
      if (isVirtuallyEmpty(dv)) continue;
      merged[key] = dv;
      out = merged as unknown as RawProperty;
      if (hasPremierTag(out)) break;
    }
  }

  return out;
}
