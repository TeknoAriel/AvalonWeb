import type { RawProperty } from '@avalon/types';

/** Slug estable para URLs internas: {id}-{fragmento-del-slug-canónico} */
export function buildPropertySlug(raw: RawProperty): string {
  let tail = 'propiedad';
  try {
    const u = new URL(raw.url);
    const parts = u.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('properties');
    if (idx >= 0 && parts[idx + 2]) {
      tail = parts[idx + 2];
    }
  } catch {
    /* url relativa o inválida */
  }
  const safe = tail
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${raw.id}-${safe || 'propiedad'}`;
}

export function parsePropertySlugParam(param: string): number | null {
  const m = /^(\d+)/.exec(param);
  if (!m) return null;
  const id = Number.parseInt(m[1], 10);
  return Number.isNaN(id) ? null : id;
}
