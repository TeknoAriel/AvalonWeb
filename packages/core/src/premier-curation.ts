import type { NormalizedProperty } from '@avalon/types';
import { parseTotalM2, parseCoveredM2 } from './property-metrics';

function parseEnvInt(name: string, fallback: number): number {
  const v = process.env[name]?.trim();
  if (!v) return fallback;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

function parseExcludeIds(): Set<number> {
  const raw = process.env.PREMIER_EXCLUDE_PROPERTY_IDS?.trim();
  if (!raw) return new Set();
  const ids = raw.split(/[\s,]+/).map((s) => Number.parseInt(s, 10));
  return new Set(ids.filter((n) => Number.isFinite(n)));
}

/**
 * Filtro de calidad opcional para listado Premier (no cambia tags; refina la colección).
 * Configuración por env (todo opcional):
 * - `PREMIER_MIN_GALLERY_IMAGES` (default 0 = no excluir por galería; usar `1` para modo estricto)
 * - `PREMIER_MIN_TOTAL_M2` (default 0 = sin mínimo)
 * - `PREMIER_EXCLUDE_PROPERTY_IDS` — IDs separados por coma o espacio
 */
export function passesPremierListingQualityGate(p: NormalizedProperty): boolean {
  const minPhotos = parseEnvInt('PREMIER_MIN_GALLERY_IMAGES', 0);
  if (p.media.images.length < minPhotos) return false;

  const minM2 = parseEnvInt('PREMIER_MIN_TOTAL_M2', 0);
  if (minM2 > 0) {
    const m = parseTotalM2(p) ?? parseCoveredM2(p);
    if (m == null || m < minM2) return false;
  }

  if (parseExcludeIds().has(p.id)) return false;
  return true;
}
