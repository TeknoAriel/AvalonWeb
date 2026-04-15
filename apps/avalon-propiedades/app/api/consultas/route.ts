import { postConsultaToKiteprop } from '@avalon/core';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const emailOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, message: 'JSON inválido' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : undefined;
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  let propertyId: number | undefined;
  if (typeof body.propertyId === 'number' && Number.isFinite(body.propertyId)) {
    propertyId = body.propertyId;
  } else if (typeof body.propertyId === 'string') {
    const n = Number.parseInt(body.propertyId, 10);
    if (Number.isFinite(n)) propertyId = n;
  }

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ ok: false, message: 'Nombre inválido' }, { status: 400 });
  }
  if (!emailOk(email)) {
    return NextResponse.json({ ok: false, message: 'Email inválido' }, { status: 400 });
  }
  if (message.length < 5 || message.length > 2000) {
    return NextResponse.json({ ok: false, message: 'Mensaje demasiado corto o largo' }, { status: 400 });
  }

  const result = await postConsultaToKiteprop({
    name,
    email,
    phone,
    message,
    propertyId,
    source: 'avalon-propiedades',
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: result.status || 502 });
  }

  return NextResponse.json({ ok: true });
}
