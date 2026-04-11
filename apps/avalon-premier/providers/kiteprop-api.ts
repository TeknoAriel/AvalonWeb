/**
 * Cliente REST hacia KiteProp API v1.
 * @see https://www.kiteprop.com/docs/api/v1
 *
 * Configuración (Vercel / .env):
 * - KITEPROP_API_BASE_URL — base sin slash final (ej. https://api.ejemplo.com/v1)
 * - KITEPROP_API_TOKEN — Bearer si el tenant lo exige
 *
 * Hasta definir endpoints concretos del tenant, las funciones devuelven null y el feed local sigue siendo la fuente.
 */

const BASE = process.env.KITEPROP_API_BASE_URL?.replace(/\/$/, '') ?? '';
const TOKEN = process.env.KITEPROP_API_TOKEN ?? '';

export type KitepropFetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

export async function kitepropFetchJson<T>(
  path: string,
  init?: RequestInit & { next?: { revalidate?: number } }
): Promise<KitepropFetchResult<T>> {
  if (!BASE) {
    return { ok: false, status: 0, message: 'KITEPROP_API_BASE_URL no configurada' };
  }
  const url = `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const { next: nextOpts, ...rest } = init ?? {};
  const revalidate = nextOpts?.revalidate ?? 3600;

  try {
    const res = await fetch(url, {
      ...rest,
      headers: {
        Accept: 'application/json',
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
        ...rest.headers,
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

/** Extensible: mapear respuesta API → RawProperty[] cuando se documente el contrato. */
export async function fetchKitepropPropertiesPreview(): Promise<KitepropFetchResult<unknown>> {
  return kitepropFetchJson<unknown>('/properties', { next: { revalidate: 1800 } });
}
