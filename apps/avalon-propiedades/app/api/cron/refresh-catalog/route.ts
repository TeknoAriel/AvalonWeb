import {
  computeCatalogSyncDiff,
  KITEPROP_PROPERTY_FEED_TAG,
  loadKitepropCatalogFromKitepropApi,
} from '@avalon/core';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

import {
  readCatalogSyncManifestFromBlob,
  writeCatalogSyncManifestToBlob,
} from '@/lib/catalog-manifest-blob';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Cron: ingesta KiteProp (forzada en servidor), manifiesto `id + last_update` en Vercel Blob (opcional),
 * y revalidación **solo** si hubo altas, cambios de `last_update` o bajas (IDs que ya no vienen en el ingest).
 * Auth: `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'CRON_SECRET no configurado' }, { status: 503 });
  }
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const rows = await loadKitepropCatalogFromKitepropApi();
  if (!rows.length) {
    return NextResponse.json(
      { ok: false, error: 'Catálogo vacío tras ingest (revisá KITEPROP_API_KEY o API).' },
      { status: 503 },
    );
  }

  const prev = await readCatalogSyncManifestFromBlob();
  const diff = computeCatalogSyncDiff(prev, rows);

  await writeCatalogSyncManifestToBlob(diff.nextManifest);

  if (diff.shouldRevalidate) {
    revalidateTag(KITEPROP_PROPERTY_FEED_TAG);
    revalidatePath('/');
    revalidatePath('/propiedades');
    revalidatePath('/contacto');
  }

  return NextResponse.json({
    ok: true,
    catalogRowCount: rows.length,
    sync: {
      changedOrNewCount: diff.changedOrNewCount,
      unchangedCount: diff.unchangedCount,
      removedCount: diff.removedCount,
      revalidated: diff.shouldRevalidate,
    },
    revalidatedPaths: diff.shouldRevalidate ? ['/', '/propiedades', '/contacto'] : [],
  });
}
