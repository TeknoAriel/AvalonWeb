import type { RawProperty } from '@avalon/types';
import { applyPremierMetadataFromDonor } from './premier-metadata-donor';

/**
 * Si el feed remoto omitió tags Premier pero el snapshot del repo los tenía para el mismo `id`,
 * copia tags y flags desde el snapshot. No inventa IDs nuevos.
 */
export function mergePremierMetadataFromRepoSnapshot(
  remote: RawProperty[],
  snapshot: RawProperty[],
): RawProperty[] {
  const byId = new Map(snapshot.map((r) => [r.id, r]));
  return remote.map((r) => {
    const prev = byId.get(r.id);
    if (!prev) return r;
    return applyPremierMetadataFromDonor(r, prev);
  });
}
