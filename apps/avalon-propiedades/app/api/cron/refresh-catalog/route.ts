import { KITEPROP_PROPERTY_FEED_TAG } from '@avalon/core';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Cron Vercel (cada 6 h): invalida caché para releer `KITEPROP_PROPERTIES_JSON_URL` / API / snapshot.
 * Auth: `Authorization: Bearer <CRON_SECRET>` (variable en Vercel).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'CRON_SECRET no configurado' }, { status: 503 });
  }
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  revalidateTag(KITEPROP_PROPERTY_FEED_TAG);
  revalidatePath('/');
  revalidatePath('/propiedades');
  revalidatePath('/contacto');

  return NextResponse.json({
    ok: true,
    revalidated: ['/', '/propiedades', '/contacto'],
  });
}
