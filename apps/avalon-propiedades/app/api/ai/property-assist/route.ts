import { buildLocalPropertyQaAnswer, getPropertyByIdFromRaw, invokeKitepropMcpTool } from '@avalon/core';
import { NextRequest, NextResponse } from 'next/server';
import { getCachedRawProperties } from '@/lib/raw-properties';
import { SITE } from '@/lib/site';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let body: { propertyId?: unknown; question?: unknown };
  try {
    body = (await req.json()) as { propertyId?: unknown; question?: unknown };
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 });
  }
  const propertyId =
    typeof body.propertyId === 'number'
      ? body.propertyId
      : typeof body.propertyId === 'string'
        ? Number.parseInt(body.propertyId, 10)
        : NaN;
  const question = typeof body.question === 'string' ? body.question : '';
  if (!Number.isFinite(propertyId) || propertyId <= 0) {
    return NextResponse.json({ message: 'propertyId inválido' }, { status: 400 });
  }
  if (question.trim().length < 2) {
    return NextResponse.json({ message: 'Pregunta demasiado corta' }, { status: 400 });
  }

  const raw = await getCachedRawProperties();
  const property = getPropertyByIdFromRaw(SITE, propertyId, raw);
  if (!property) {
    return NextResponse.json({ message: 'Propiedad no encontrada' }, { status: 404 });
  }

  const local = buildLocalPropertyQaAnswer(property, question);
  const mcp = await invokeKitepropMcpTool<{ answer?: string; summary?: string }>('get_property', {
    id: propertyId,
    query: question,
  });
  if (mcp.ok && mcp.data && typeof mcp.data === 'object') {
    const ext = mcp.data.answer || mcp.data.summary;
    if (typeof ext === 'string' && ext.trim()) {
      return NextResponse.json({ answer: ext.trim(), source: 'mcp_bridge' });
    }
  }
  return NextResponse.json({ answer: local, source: 'local' });
}
