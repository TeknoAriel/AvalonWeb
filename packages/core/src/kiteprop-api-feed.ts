import type { RawProperty } from '@avalon/types';
import { enrichRawPropertyFromKitepropAliases, mapKitepropApiV1PropertyToRaw } from './kiteprop-api-mapper';
import { extractKitepropPropertyFeedRows } from './kiteprop-feed-payload';
import { kitepropOutboundUserAgent } from './kiteprop-outbound';
import { applyPremierMetadataFromDonor } from './premier-metadata-donor';

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

function statusNorm(raw: RawProperty): string {
  return String(raw.status ?? '').trim().toLowerCase();
}

/**
 * Estados a pedir a la API. Por defecto `active` + `active_unpublished` (Premier puede listar
 * unpublished vía `isPubliclyListedForSite`). Con `KITEPROP_API_NO_ACTIVE_UNPUBLISHED=1` solo el
 * filtro explícito en `KITEPROP_API_STATUS_FILTER` (default `active`).
 */
function catalogStatusFilters(): string[] {
  const raw = (process.env.KITEPROP_API_STATUS_FILTER || 'active')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const list = raw.length ? raw : ['active'];
  const lower = list.map((s) => s.toLowerCase());
  const skipUnpublished = process.env.KITEPROP_API_NO_ACTIVE_UNPUBLISHED === '1';
  if (!skipUnpublished && list.length === 1 && lower[0] === 'active' && !lower.includes('active_unpublished')) {
    return ['active', 'active_unpublished'];
  }
  return list;
}

function mergeCatalogRow(map: Map<number, RawProperty>, row: RawProperty): void {
  const prev = map.get(row.id);
  if (!prev) {
    map.set(row.id, row);
    return;
  }
  const ps = statusNorm(prev);
  const ns = statusNorm(row);
  if (ps === 'active_unpublished' && ns === 'active') {
    map.set(row.id, applyPremierMetadataFromDonor(row, prev));
    return;
  }
  if (ps === 'active' && ns === 'active_unpublished') {
    map.set(row.id, applyPremierMetadataFromDonor(prev, row));
    return;
  }
  map.set(row.id, applyPremierMetadataFromDonor(prev, row));
}

async function fetchKitepropPropertyFeedPagesForStatus(
  status: string,
  base: string,
  pathNorm: string,
  perPage: number,
  fetchInit?: RequestInit & { next?: { revalidate?: number } },
): Promise<RawProperty[] | null> {
  const out: RawProperty[] = [];
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
      if (mapped) out.push(enrichRawPropertyFromKitepropAliases(mapped, row));
    }

    const pag = extractPagination(json);
    lastPage = pag.lastPage;
    page += 1;
    if (page > 500) break;
  } while (page <= lastPage);

  return out;
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

  const statuses = catalogStatusFilters();
  const byId = new Map<number, RawProperty>();
  let anyOk = false;

  for (const status of statuses) {
    const chunk = await fetchKitepropPropertyFeedPagesForStatus(status, base, pathNorm, perPage, fetchInit);
    if (chunk === null) {
      if (statuses[0] === status) return null;
      continue;
    }
    anyOk = true;
    for (const r of chunk) mergeCatalogRow(byId, r);
  }

  if (!anyOk) return null;
  return byId.size ? [...byId.values()] : null;
}

export function kitepropApiFeedConfigured(): boolean {
  return Boolean(apiKey());
}
