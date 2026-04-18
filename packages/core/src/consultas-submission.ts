import { resolveAvalonInternalApiOrigin, resolveServerToServerBearerSecret } from './avalon-internal-api';
import { kitepropApiFeedConfigured } from './kiteprop-api-feed';
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

/**
 * Igual que `submitWebConsulta`, pero si el sitio es Premier y está configurado el proxy hacia Avalon Web,
 * el POST se reenvía al BFF interno (mismo `CRON_SECRET` / secreto servidor que el catálogo). Así Premier puede
 * operar sin `KITEPROP_API_KEY` si solo usás ingest centralizado.
 */
export async function submitWebConsultaWithOptionalAvalonProxy(
  source: WebConsultaSource,
  body: Record<string, unknown>,
): Promise<SubmitWebConsultaResult> {
  const secret = resolveServerToServerBearerSecret();
  const origin = resolveAvalonInternalApiOrigin();
  if (source === 'avalon-premier' && origin && secret) {
    try {
      const url = `${origin.replace(/\/$/, '')}/api/internal/consultas`;
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secret}`,
          'X-Web-Consulta-Source': 'avalon-premier',
        },
        body: JSON.stringify(body),
      });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (r.ok && j && j.ok === true) {
        return { ok: true };
      }
      if (kitepropApiFeedConfigured()) {
        return submitWebConsulta(source, body);
      }
      const msg =
        typeof j.message === 'string' && j.message.length > 0 ? j.message : 'No se pudo enviar la consulta';
      return { ok: false, status: r.status || 502, message: msg };
    } catch {
      if (kitepropApiFeedConfigured()) {
        return submitWebConsulta(source, body);
      }
      return { ok: false, status: 502, message: 'No se pudo contactar al servidor Avalon Web' };
    }
  }

  return submitWebConsulta(source, body);
}
