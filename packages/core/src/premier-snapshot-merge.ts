import type { RawProperty } from '@avalon/types';
import { hasPremierTag } from './premier';

function isVirtuallyEmpty(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (Array.isArray(v) && v.length === 0) return true;
  if (typeof v === 'string' && v.trim() === '') return true;
  return false;
}

/** Si el remoto trae `tags: []` u omite el campo, `??` no alcanza: preferimos el snapshot cuando aporta datos. */
function preferSnapshotField(prev: unknown, cur: unknown): unknown {
  if (isVirtuallyEmpty(cur) && !isVirtuallyEmpty(prev)) return prev;
  return cur;
}

/**
 * Campos que `hasPremierTag` puede usar (además de `tags` / `labels` / `categories` en `RawProperty`).
 * Si un ingest nuevo deja de mandar `tags` pero el CRM mandaba Premier en `property_tags` / difusión, el
 * merge debe poder copiar esas claves desde el snapshot por `id`.
 */
const PREMIER_SNAPSHOT_FIELD_KEYS: readonly string[] = [
  'tags',
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
  'segment',
  'collection',
  'tier',
  'class',
  'tag',
  'tag_slug',
  'tier_slug',
];

/**
 * Si el feed remoto/API omitió tags Premier pero el snapshot del repo los tenía para el mismo `id`,
 * copia tags y flags para no perder curaduría cuando la difusión KiteProp deja de exportar etiquetas.
 * No inventa IDs nuevos: solo alinea filas que ya existían etiquetadas en el snapshot versionado.
 */
export function mergePremierMetadataFromRepoSnapshot(
  remote: RawProperty[],
  snapshot: RawProperty[],
): RawProperty[] {
  const byId = new Map(snapshot.map((r) => [r.id, r]));
  return remote.map((r) => {
    if (hasPremierTag(r)) return r;
    const prev = byId.get(r.id);
    if (!prev || !hasPremierTag(prev)) return r;

    const merged: Record<string, unknown> = { ...r };
    const p = prev as unknown as Record<string, unknown>;

    for (const key of PREMIER_SNAPSHOT_FIELD_KEYS) {
      merged[key] = preferSnapshotField(p[key], merged[key]);
    }

    let out = merged as unknown as RawProperty;
    if (!hasPremierTag(out)) {
      for (const key of PREMIER_SNAPSHOT_FIELD_KEYS) {
        const pv = p[key];
        if (isVirtuallyEmpty(pv)) continue;
        merged[key] = pv;
        out = merged as unknown as RawProperty;
        if (hasPremierTag(out)) break;
      }
    }

    return out;
  });
}
