/**
 * Reenvío de consultas del sitio al CRM vía API KiteProp (POST).
 * Configuración:
 * - KITEPROP_API_KEY (o KITEPROP_API_TOKEN) → cabecera X-API-Key
 * - KITEPROP_API_CONSULTA_URL → URL completa del POST (la que indique la doc / soporte KP)
 *   o bien KITEPROP_API_BASE_URL + KITEPROP_API_CONSULTA_PATH (ej. /messages)
 *
 * El cuerpo JSON por defecto es genérico; si KiteProp exige otros nombres de campo,
 * ajustá esta función o añadí normalización según la doc oficial.
 */

export type KitepropConsultaInput = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  propertyId?: number;
  /** Origen para auditoría (ej. avalon-propiedades / avalon-premier) */
  source?: string;
};

export type KitepropConsultaResult =
  | { ok: true; status: number }
  | { ok: false; status: number; message: string };

function resolveConsultaUrl(): string | null {
  const direct = process.env.KITEPROP_API_CONSULTA_URL?.trim();
  if (direct) return direct;

  const base = process.env.KITEPROP_API_BASE_URL?.replace(/\/$/, '') ?? '';
  const path = process.env.KITEPROP_API_CONSULTA_PATH?.trim() ?? '';
  if (!base || !path) return null;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

function apiKey(): string {
  return (process.env.KITEPROP_API_KEY || process.env.KITEPROP_API_TOKEN || '').trim();
}

/** POST al endpoint configurado. Si no hay URL/path, devuelve 503. */
export async function postConsultaToKiteprop(
  input: KitepropConsultaInput,
): Promise<KitepropConsultaResult> {
  const url = resolveConsultaUrl();
  const key = apiKey();
  if (!url) {
    return {
      ok: false,
      status: 503,
      message:
        'Consultas: configurá KITEPROP_API_CONSULTA_URL (URL completa del POST) o KITEPROP_API_BASE_URL + KITEPROP_API_CONSULTA_PATH según la doc de KiteProp.',
    };
  }
  if (!key) {
    return { ok: false, status: 503, message: 'KITEPROP_API_KEY no configurada.' };
  }

  const body = {
    full_name: input.name.trim(),
    email: input.email.trim(),
    phone: (input.phone ?? '').trim(),
    body: input.message.trim(),
    property_id: input.propertyId ?? null,
    source: input.source ?? 'avalon_web',
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-API-Key': key,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      return { ok: false, status: res.status, message: text.slice(0, 500) };
    }
    return { ok: true, status: res.status };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'fetch error';
    return { ok: false, status: 0, message: msg };
  }
}
