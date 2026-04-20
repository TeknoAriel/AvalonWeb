import {
  getSitePropertiesFromRaw,
  KITEPROP_PROPERTY_FEED_TAG,
  kitepropApiFeedConfigured,
  loadKitepropCatalogMerged,
} from '@avalon/core';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Cron Vercel: fuerza una lectura del mismo catálogo que las páginas (`loadKitepropCatalogMerged`),
 * falla con 503 si el lote queda vacío (misma señal operativa que Avalon Web), revalida rutas.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'CRON_SECRET no configurado' }, { status: 503 });
  }
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const raw = await loadKitepropCatalogMerged();
  if (!raw.length) {
    return NextResponse.json(
      { ok: false, error: 'Catálogo vacío (revisá KITEPROP_API_KEY, BFF Web o feed).' },
      { status: 503 },
    );
  }

  const premierSiteListableCount = getSitePropertiesFromRaw('premier', raw).length;

  revalidateTag(KITEPROP_PROPERTY_FEED_TAG);
  revalidatePath('/');
  revalidatePath('/propiedades');
  revalidatePath('/institucional');
  revalidatePath('/contacto');

  return NextResponse.json({
    ok: true,
    catalogRowCount: raw.length,
    premierSiteListableCount,
    kitepropApiConfigured: kitepropApiFeedConfigured(),
    revalidated: ['/', '/propiedades', '/institucional', '/contacto'],
  });
}
