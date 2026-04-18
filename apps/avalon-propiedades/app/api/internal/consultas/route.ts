import { resolveServerToServerBearerSecret, submitWebConsulta, type WebConsultaSource } from '@avalon/core';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Reenvío de consultas web hacia KiteProp (solo servidor Avalon Web tiene la key).
 * Auth: `Authorization: Bearer <CRON_SECRET>` (o legacy `INTERNAL_CATALOG_SECRET`).
 * Header: `X-Web-Consulta-Source: avalon-premier` (u omitir para avalon-propiedades).
 */
export async function POST(req: NextRequest) {
  const secret = resolveServerToServerBearerSecret();
  if (!secret) {
    return NextResponse.json(
      { ok: false, message: 'Definí CRON_SECRET (o INTERNAL_CATALOG_SECRET) en el servidor' },
      { status: 503 },
    );
  }
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, message: 'No autorizado' }, { status: 401 });
  }

  const sourceHeader = req.headers.get('x-web-consulta-source');
  const source: WebConsultaSource =
    sourceHeader === 'avalon-premier' ? 'avalon-premier' : 'avalon-propiedades';

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, message: 'JSON inválido' }, { status: 400 });
  }

  const result = await submitWebConsulta(source, body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
