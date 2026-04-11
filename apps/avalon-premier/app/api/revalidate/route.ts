import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhook opcional para ISR (Vercel / cron).
 * POST /api/revalidate?secret=REVALIDATE_SECRET
 */
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  revalidatePath('/');
  revalidatePath('/propiedades');
  revalidatePath('/institucional');
  revalidatePath('/contacto');

  return NextResponse.json({ ok: true, revalidated: true });
}
