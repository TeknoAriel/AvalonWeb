import {
  isCatalogIngestDebug,
  kitepropApiFeedConfigured,
  loadKitepropCatalogFromKitepropApi,
  resolveServerToServerBearerSecret,
} from '@avalon/core';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * BFF de catálogo: lectura KiteProp en vivo (lado Avalon Web). Sin fallback a `properties.json`.
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
  if (!catalog.length && !debug) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Catálogo vacío: revisá KITEPROP_API_KEY y KITEPROP_API_URL / KITEPROP_API_BASE_URL en este proyecto.',
      },
      { status: 503 },
    );
  }
  return NextResponse.json(catalog, {
    headers: {
      'Cache-Control': 'private, no-store',
      'X-Avalon-Catalog-Rows': String(catalog.length),
      'X-Avalon-Kiteprop-Configured': kitepropApiFeedConfigured() ? '1' : '0',
    },
  });
}
