import { ALL_RAW_PROPERTIES, fetchKitepropPropertyFeedAsRaw } from '@avalon/core';
import type { RawProperty } from '@avalon/types';
import { cache } from 'react';

const nextRevalidate = { next: { revalidate: 900 } } as RequestInit & { next: { revalidate: number } };

/**
 * Orden: 1) JSON remoto 2) API KiteProp v1 3) snapshot del repo.
 */
async function loadRawProperties(): Promise<RawProperty[]> {
  const url = process.env.KITEPROP_PROPERTIES_JSON_URL?.trim();
  if (url) {
    try {
      const res = await fetch(url, nextRevalidate);
      if (res.ok) {
        const data: unknown = await res.json();
        if (Array.isArray(data) && data.length > 0) return data as RawProperty[];
      }
    } catch {
      /* fallback */
    }
  }

  const fromApi = await fetchKitepropPropertyFeedAsRaw(nextRevalidate);
  if (fromApi?.length) return fromApi;

  return ALL_RAW_PROPERTIES;
}

export const getCachedRawProperties = cache(loadRawProperties);
