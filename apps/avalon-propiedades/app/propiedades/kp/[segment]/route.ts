import { kitepropEntryRedirect } from '@/lib/kiteprop-entry-redirect';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Legacy / URLs externas: `/propiedades/kp/{id}` o `/propiedades/kp/{id}-propiedad`.
 * Misma lógica que `/kp/[id]`.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ segment: string }> }) {
  const { segment } = await context.params;
  return kitepropEntryRedirect(request, segment);
}
