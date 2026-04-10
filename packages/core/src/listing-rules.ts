import type { RawProperty } from '@avalon/types';

/** Propiedades visibles en catálogo público (ajustar si el negocio publica otros estados) */
export function isPubliclyListed(raw: RawProperty): boolean {
  return raw.status === 'active';
}
