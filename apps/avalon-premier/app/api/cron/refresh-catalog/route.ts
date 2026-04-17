import { KITEPROP_PROPERTY_FEED_TAG } from '@avalon/core';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Cron Vercel (cada 2 h): invalida caché de páginas para volver a leer JSON/API de KiteProp.
 * Vercel envía `Authorization: Bearer <CRON_SECRET>` si definís `CRON_SECRET` en el proyecto.
 * El catálogo sigue siendo el feed remoto; una ficha que ya no venga en el JSON deja de listarse sola.
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
  revalidatePath('/institucional');
  revalidatePath('/contacto');

  return NextResponse.json({
    ok: true,
    revalidated: ['/', '/propiedades', '/institucional', '/contacto'],
  });
}
