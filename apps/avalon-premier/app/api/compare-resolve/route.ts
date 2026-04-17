import { getNormalizedPropertiesByIdsForSite, loadKitepropCatalogMerged } from '@avalon/core';
import { NextResponse } from 'next/server';
import { SITE } from '@/lib/site';

export const dynamic = 'force-dynamic';

const MAX_IDS = 12;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }
  const idsRaw = (body as { ids?: unknown }).ids;
  if (!Array.isArray(idsRaw)) {
    return NextResponse.json({ error: 'ids debe ser un array' }, { status: 400 });
  }
  const ids: number[] = [];
  for (const x of idsRaw) {
    const n = typeof x === 'number' ? x : typeof x === 'string' ? Number.parseInt(x, 10) : NaN;
    if (Number.isFinite(n) && n > 0) ids.push(Math.trunc(n));
    if (ids.length >= MAX_IDS) break;
  }
  if (ids.length === 0) {
    return NextResponse.json({ properties: [] });
  }

  const raw = await loadKitepropCatalogMerged();
  const properties = getNormalizedPropertiesByIdsForSite(SITE, ids, raw);
  return NextResponse.json({ properties });
}
