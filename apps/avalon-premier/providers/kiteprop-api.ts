/**
 * Cliente REST KiteProp v1 (`X-API-Key`). Variables y flujo de consultas: `docs/KITEPROP.md`.
 * @see https://www.kiteprop.com/docs/api/v1
 */

import { kitepropOutboundUserAgent } from '@avalon/core';

const BASE = (process.env.KITEPROP_API_BASE_URL || 'https://www.kiteprop.com/api/v1').replace(
  /\/$/,
  '',
);
const API_KEY = (process.env.KITEPROP_API_KEY || process.env.KITEPROP_API_TOKEN || '').trim();

export type KitepropFetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

export async function kitepropFetchJson<T>(
  path: string,
  init?: RequestInit & { next?: { revalidate?: number } }
): Promise<KitepropFetchResult<T>> {
  if (!API_KEY) {
    return { ok: false, status: 0, message: 'KITEPROP_API_KEY (o KITEPROP_API_TOKEN) no configurada' };
  }
  const url = `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const { next: nextOpts, headers: extraHeaders, ...rest } = init ?? {};
  const revalidate = nextOpts?.revalidate ?? 3600;

  try {
    const res = await fetch(url, {
      ...rest,
      headers: {
        Accept: 'application/json',
        'X-API-Key': API_KEY,
        'User-Agent': kitepropOutboundUserAgent(),
        ...(extraHeaders as Record<string, string>),
      },
      next: { revalidate },
    });
    if (!res.ok) {
      return { ok: false, status: res.status, message: await res.text().catch(() => res.statusText) };
    }
    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'fetch error';
    return { ok: false, status: 0, message: msg };
  }
}

/** Prueba de conectividad (perfil / tenant). */
export async function fetchKitepropPropertiesPreview(): Promise<KitepropFetchResult<unknown>> {
  return kitepropFetchJson<unknown>('/profile', { next: { revalidate: 1800 } });
}
