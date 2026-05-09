import { kitepropEntryRedirect } from '@/lib/kiteprop-entry-redirect';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Entrada canónica desde KiteProp: `https://<sitio>/kp/{idPropiedad}`.
 * Redirige a la ficha en Avalon o Premier según tag Premier en el feed.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return kitepropEntryRedirect(request, id);
}
