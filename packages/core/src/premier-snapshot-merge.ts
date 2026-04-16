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
    return {
      ...r,
      tags: preferSnapshotField(prev.tags, r.tags) as RawProperty['tags'],
      labels: preferSnapshotField(prev.labels, r.labels) as RawProperty['labels'],
      categories: preferSnapshotField(prev.categories, r.categories) as RawProperty['categories'],
      premier: prev.premier !== undefined && prev.premier !== null ? prev.premier : r.premier,
      is_premier: prev.is_premier !== undefined && prev.is_premier !== null ? prev.is_premier : r.is_premier,
    };
  });
}
