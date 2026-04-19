import type { NormalizedProperty } from '@avalon/types';

import { pickHeroImageUrlsFromList } from '@/components/hero-premier';

/**
 * URLs fijas (p. ej. `/public/brand/premier-hero-*.jpg`) cuando tengan assets curados.
 * Dejar vacío hasta cargar imágenes premium; no afecta el build.
 */
export const PREMIER_HERO_MANUAL_POSTERS: readonly string[] = [
  // Ejemplo: '/brand/premier-hero-rosario-1.jpg',
];

function readEnvCuratedPosterUrls(): string[] {
  const raw =
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_PREMIER_HERO_IMAGE_URLS?.trim()) ||
    (typeof process !== 'undefined' && process.env.PREMIER_HERO_IMAGE_URLS?.trim()) ||
    '';
  if (!raw) return [];
  return raw.split(/[,\n|]+/).map((s) => s.trim()).filter(Boolean);
}

/**
 * 6–8 URLs para el hero: primero env + manuales (curación), luego inventario KiteProp sin duplicar.
 * Rosario / Córdoba / BA / Punta / Chile: conviven en la misma lista cuando sumes URLs en env o en
 * `PREMIER_HERO_MANUAL_POSTERS`.
 */
export function resolvePremierHeroPosterUrls(inventory: NormalizedProperty[], max = 8): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (u: string) => {
    const t = u.trim();
    if (!t || seen.has(t)) return;
    seen.add(t);
    out.push(t);
  };
  for (const u of readEnvCuratedPosterUrls()) push(u);
  for (const u of PREMIER_HERO_MANUAL_POSTERS) push(u);
  if (out.length >= max) return out.slice(0, max);
  for (const u of pickHeroImageUrlsFromList(inventory, max)) {
    push(u);
    if (out.length >= max) break;
  }
  return out.slice(0, max);
}
