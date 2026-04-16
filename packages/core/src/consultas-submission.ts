import { postConsultaToKiteprop, type KitepropConsultaInput, type KitepropConsultaResult } from './kiteprop-consulta';

export type WebConsultaSource = 'avalon-propiedades' | 'avalon-premier';

const emailOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

function parsePropertyId(body: Record<string, unknown>): number | undefined {
  const raw = body.propertyId;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string') {
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

export type SubmitWebConsultaResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

/**
 * Valida el JSON del formulario web y reenvía a KiteProp (`postConsultaToKiteprop`).
 * Usado por `app/api/consultas/route.ts` en ambas apps.
 */
export async function submitWebConsulta(
  source: WebConsultaSource,
  body: Record<string, unknown>,
): Promise<SubmitWebConsultaResult> {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : undefined;
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const leadIntent =
    typeof body.leadIntent === 'string' && body.leadIntent.trim().length <= 120
      ? body.leadIntent.trim()
      : undefined;
  const propertyId = parsePropertyId(body);

  if (name.length < 2 || name.length > 120) {
    return { ok: false, status: 400, message: 'Nombre inválido' };
  }
  if (!emailOk(email)) {
    return { ok: false, status: 400, message: 'Email inválido' };
  }
  if (message.length < 5 || message.length > 2000) {
    return { ok: false, status: 400, message: 'Mensaje demasiado corto o largo' };
  }

  const input: KitepropConsultaInput = {
    name,
    email,
    phone,
    message,
    propertyId,
    source,
    leadIntent,
  };

  const result: KitepropConsultaResult = await postConsultaToKiteprop(input);
  if (!result.ok) {
    return { ok: false, status: result.status || 502, message: result.message };
  }
  return { ok: true };
}
