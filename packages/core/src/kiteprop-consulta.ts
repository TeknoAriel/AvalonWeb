/**
 * POST al CRM KiteProp (`/api/v1/messages`, `/api/v1/contacts` o URL legacy).
 * Contrato y variables: `docs/KITEPROP.md`.
 */

export type KitepropConsultaInput = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  propertyId?: number;
  /** Origen CRM (ej. avalon-propiedades / avalon-premier / Web Avalon) */
  source?: string;
};

export type KitepropConsultaResult =
  | { ok: true; status: number }
  | { ok: false; status: number; message: string };

function apiKey(): string {
  return (process.env.KITEPROP_API_KEY || process.env.KITEPROP_API_TOKEN || '').trim();
}

/** Host sin path final (ej. https://www.kiteprop.com). */
function resolveKitepropApiRoot(): string {
  const direct = process.env.KITEPROP_API_URL?.trim();
  if (direct) return direct.replace(/\/$/, '');

  const base = process.env.KITEPROP_API_BASE_URL?.trim() ?? '';
  if (base) {
    const b = base.replace(/\/$/, '');
    if (b.endsWith('/api/v1')) return b.slice(0, -'/api/v1'.length);
    return b;
  }

  return 'https://www.kiteprop.com';
}

function splitName(full: string): { first_name: string; last_name?: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { first_name: 'Consulta' };
  const first_name = parts[0]!;
  const rest = parts.slice(1).join(' ');
  if (!rest) return { first_name };
  return { first_name, last_name: rest };
}

async function postJson(
  url: string,
  key: string,
  body: Record<string, unknown>,
): Promise<KitepropConsultaResult> {
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

export async function postConsultaToKiteprop(
  input: KitepropConsultaInput,
): Promise<KitepropConsultaResult> {
  const key = apiKey();
  if (!key) {
    return { ok: false, status: 503, message: 'KITEPROP_API_KEY no configurada.' };
  }

  const legacyUrl = process.env.KITEPROP_API_CONSULTA_URL?.trim();
  if (legacyUrl) {
    const body = {
      full_name: input.name.trim(),
      email: input.email.trim(),
      phone: (input.phone ?? '').trim(),
      body: input.message.trim(),
      property_id: input.propertyId ?? null,
      source: input.source ?? 'avalon_web',
    };
    return postJson(legacyUrl, key, body);
  }

  const root = resolveKitepropApiRoot();
  const pid = input.propertyId;
  const hasProperty =
    pid != null && Number.isFinite(pid) && typeof pid === 'number' && pid > 0;

  if (hasProperty) {
    const footer = [
      `Nombre: ${input.name.trim()}`,
      input.phone?.trim() ? `Tel: ${input.phone.trim()}` : null,
    ]
      .filter(Boolean)
      .join(' · ');
    const bodyText = `${input.message.trim()}\n\n— ${footer}`;
    return postJson(`${root}/api/v1/messages`, key, {
      email: input.email.trim(),
      body: bodyText,
      property_id: pid,
    });
  }

  const { first_name, last_name } = splitName(input.name);
  const payload: Record<string, unknown> = {
    first_name,
    email: input.email.trim(),
    summary: input.message.trim(),
    source: input.source ?? 'Web Avalon',
  };
  if (last_name) payload.last_name = last_name;
  if (input.phone?.trim()) payload.phone = input.phone.trim();

  return postJson(`${root}/api/v1/contacts`, key, payload);
}
