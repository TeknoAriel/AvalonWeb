import { ALL_RAW_PROPERTIES } from '@avalon/core';
import type { RawProperty } from '@avalon/types';
import { cache } from 'react';

/**
 * Feed JSON (mismo esquema que `packages/core/data/properties.json`).
 * Si está definida, Next intenta usarla en servidor con revalidación ISR.
 */
async function loadRawProperties(): Promise<RawProperty[]> {
  const url = process.env.KITEPROP_PROPERTIES_JSON_URL?.trim();
  if (!url) return ALL_RAW_PROPERTIES;

  try {
    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) return ALL_RAW_PROPERTIES;
    const data: unknown = await res.json();
    if (!Array.isArray(data) || data.length === 0) return ALL_RAW_PROPERTIES;
    return data as RawProperty[];
  } catch {
    return ALL_RAW_PROPERTIES;
  }
}

export const getCachedRawProperties = cache(loadRawProperties);
