import type { RawProperty } from '@avalon/types';

/** Manifiesto persistido: solo `id` + `last_update` por fila (última vez visto en ingest). */
export type CatalogSyncManifest = {
  entries: Record<string, { last_update: string }>;
  savedAt: string;
};

export type CatalogSyncDiffResult = {
  nextManifest: CatalogSyncManifest;
  /** Filas cuyo `last_update` difiere del manifiesto anterior o son IDs nuevos. */
  changedOrNewCount: number;
  unchangedCount: number;
  /** IDs que estaban en el manifiesto y ya no vienen en el ingest (baja). */
  removedCount: number;
  /** Si conviene revalidar caché Next (hubo alta, cambio o baja). */
  shouldRevalidate: boolean;
};

/**
 * Compara el ingest actual contra el manifiesto previo.
 * - Sin manifiesto previo → se considera primer corrido: `shouldRevalidate` = true.
 * - Con manifiesto: revalidar solo si hay filas nuevas, `last_update` distinto, o IDs removidos (no vinieron en este ingest).
 */
export function computeCatalogSyncDiff(
  prev: CatalogSyncManifest | null,
  rows: RawProperty[],
): CatalogSyncDiffResult {
  const entries: Record<string, { last_update: string }> = {};
  for (const r of rows) {
    entries[String(r.id)] = { last_update: String(r.last_update ?? '') };
  }

  let unchangedCount = 0;
  let changedOrNewCount = 0;

  for (const r of rows) {
    const id = String(r.id);
    const lu = String(r.last_update ?? '');
    const old = prev?.entries[id];
    if (!old) {
      changedOrNewCount += 1;
    } else if (old.last_update === lu) {
      unchangedCount += 1;
    } else {
      changedOrNewCount += 1;
    }
  }

  let removedCount = 0;
  if (prev?.entries) {
    for (const id of Object.keys(prev.entries)) {
      if (!(id in entries)) removedCount += 1;
    }
  }

  const nextManifest: CatalogSyncManifest = {
    entries,
    savedAt: new Date().toISOString(),
  };

  const shouldRevalidate =
    prev == null || changedOrNewCount > 0 || removedCount > 0;

  return {
    nextManifest,
    changedOrNewCount,
    unchangedCount,
    removedCount,
    shouldRevalidate,
  };
}
