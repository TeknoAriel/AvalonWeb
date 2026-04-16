import { propertyListFiltersToQuery, resolveNaturalSearchInterpretation } from '@avalon/core';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let body: { q?: unknown; cities?: unknown };
  try {
    body = (await req.json()) as { q?: unknown; cities?: unknown };
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 });
  }
  const q = typeof body.q === 'string' ? body.q : '';
  const cities = Array.isArray(body.cities)
    ? body.cities.filter((x): x is string => typeof x === 'string')
    : [];
  const { filters, understood, usedMcpBridge } = await resolveNaturalSearchInterpretation(q, cities);
  return NextResponse.json({
    query: propertyListFiltersToQuery(filters),
    understood,
    usedMcpBridge,
  });
}
