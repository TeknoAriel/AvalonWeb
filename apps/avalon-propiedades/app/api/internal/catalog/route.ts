import {
  isCatalogIngestDebug,
  loadKitepropCatalogFromKitepropApi,
  resolveServerToServerBearerSecret,
} from '@avalon/core';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * BFF de catálogo: una sola lectura KiteProp + snapshot (lado Avalon Web).
 * Auth: `Authorization: Bearer <CRON_SECRET>` salvo depuración: `CATALOG_INGEST_DEBUG=1` → sin Bearer.
 */
export async function GET(req: NextRequest) {
  const debug = isCatalogIngestDebug();
  if (!debug) {
    const secret = resolveServerToServerBearerSecret();
    if (!secret) {
      return NextResponse.json(
        { ok: false, error: 'Definí CRON_SECRET (o INTERNAL_CATALOG_SECRET), o CATALOG_INGEST_DEBUG=1' },
        { status: 503 },
      );
    }
    if (req.headers.get('authorization') !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  const catalog = await loadKitepropCatalogFromKitepropApi();
  return NextResponse.json(catalog, {
    headers: {
      'Cache-Control': 'private, no-store',
    },
  });
}
