import type { RawProperty } from '@avalon/types';
import { enrichRawPropertyFromKitepropAliases, mapKitepropApiV1PropertyToRaw } from './kiteprop-api-mapper';
import { extractKitepropPropertyFeedRows } from './kiteprop-feed-payload';
import { kitepropOutboundUserAgent } from './kiteprop-outbound';

function apiKey(): string {
  return (process.env.KITEPROP_API_KEY || process.env.KITEPROP_API_TOKEN || '').trim();
}

function apiBase(): string {
  return (process.env.KITEPROP_API_BASE_URL || 'https://www.kiteprop.com/api/v1').replace(/\/$/, '');
}

function authHeaders(): HeadersInit {
  const key = apiKey();
  const h: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': kitepropOutboundUserAgent(),
  };
  if (key) h['X-API-Key'] = key;
  return h;
}

function extractPagination(payload: unknown): { lastPage: number; currentPage: number } {
  if (!payload || typeof payload !== 'object') return { lastPage: 1, currentPage: 1 };
  const o = payload as Record<string, unknown>;
  const pag = o.pagination;
  if (pag && typeof pag === 'object') {
    const p = pag as Record<string, unknown>;
    return {
      lastPage: Math.max(1, num(p.last_page)),
      currentPage: Math.max(1, num(p.current_page)),
    };
  }
  return { lastPage: 1, currentPage: 1 };
}

function num(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.floor(v);
  if (typeof v === 'string') {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) ? n : 1;
  }
  return 1;
}

/** GET paginado de propiedades → `RawProperty[]`. Variables: `docs/KITEPROP.md`. */
export async function fetchKitepropPropertyFeedAsRaw(
  fetchInit?: RequestInit & { next?: { revalidate?: number } },
): Promise<RawProperty[] | null> {
  const key = apiKey();
  const base = apiBase();
  if (!key) return null;

  const path = (process.env.KITEPROP_API_PROPERTIES_PATH || '/properties').trim();
  const pathNorm = path.startsWith('/') ? path : `/${path}`;
  const perPage = Math.min(
    100,
    Math.max(10, Number.parseInt(process.env.KITEPROP_API_PER_PAGE || '50', 10) || 50),
  );
  const status = (process.env.KITEPROP_API_STATUS_FILTER || 'active').trim();

  const all: RawProperty[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const qs = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
      status,
    });
    const url = `${base}${pathNorm}?${qs.toString()}`;
    const res = await fetch(url, {
      ...fetchInit,
      headers: {
        ...authHeaders(),
        ...((fetchInit?.headers as Record<string, string>) || {}),
      },
    });

    if (!res.ok) {
      if (page === 1) return null;
      break;
    }

    const json: unknown = await res.json();
    const rows = extractKitepropPropertyFeedRows(json);
    for (const row of rows) {
      const mapped = mapKitepropApiV1PropertyToRaw(row);
      if (mapped) all.push(enrichRawPropertyFromKitepropAliases(mapped, row));
    }

    const pag = extractPagination(json);
    lastPage = pag.lastPage;
    page += 1;
    if (page > 500) break;
  } while (page <= lastPage);

  return all.length ? all : null;
}

export function kitepropApiFeedConfigured(): boolean {
  return Boolean(apiKey());
}
