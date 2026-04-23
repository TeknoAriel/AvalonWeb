import { kitepropOutboundUserAgent } from './kiteprop-outbound';
import { submitConsultaViaLeadAdapters } from './kiteprop-leads-adapter';

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
  propertyCode?: string;
  propertyTitle?: string;
  site?: string;
  pageUrl?: string;
  assignedUserId?: number;
  userId?: number;
  assignedUserName?: string;
  /** Origen CRM (ej. avalon-propiedades / avalon-premier / Web Avalon) */
  source?: string;
  /** Etiqueta corta de intención (se antepone al cuerpo del mensaje en el CRM) */
  leadIntent?: string;
  /** Código estable del motivo (p. ej. visita, similar); opcional, no sustituye el texto humano. */
  leadIntentId?: string;
};

export type KitepropConsultaResult =
  | { ok: true; status: number }
  | { ok: false; status: number; message: string };

function apiKey(): string {
  return (process.env.KITEPROP_API_KEY || process.env.KITEPROP_API_TOKEN || '').trim();
}

const LEAD_INTENT_IDS = new Set(['visita', 'contacto', 'similar', 'zona', 'tasacion']);

function buildIntentPrefix(input: KitepropConsultaInput): string {
  const id = input.leadIntentId?.trim();
  const label = input.leadIntent?.trim();
  if (id && LEAD_INTENT_IDS.has(id)) {
    const human = label && label.length <= 120 ? ` — ${label}` : '';
    return `[Motivo: ${id}${human}]\n\n`;
  }
  if (label) {
    return `[Intención: ${label}]\n\n`;
  }
  return '';
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
        'User-Agent': kitepropOutboundUserAgent(),
      },
      body: JSON.stringify(body),
    });

    const raw = await res.text().catch(() => res.statusText);
    if (!res.ok) {
      return { ok: false, status: res.status, message: raw.slice(0, 500) };
    }
    const json = (() => {
      try {
        return JSON.parse(raw) as Record<string, unknown>;
      } catch {
        return null;
      }
    })();
    if (json && typeof json === 'object' && 'success' in json && json.success === false) {
      const err =
        typeof json.errorMessage === 'string' && json.errorMessage.trim()
          ? json.errorMessage.trim()
          : 'KiteProp respondió success=false';
      return { ok: false, status: res.status, message: `${err} · ${raw.slice(0, 400)}` };
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
  const intentPrefix = buildIntentPrefix(input);

  if (legacyUrl) {
    const extras = [
      input.propertyTitle ? `Propiedad: ${input.propertyTitle}` : null,
      input.propertyCode ? `Código: ${input.propertyCode}` : null,
      input.pageUrl ? `URL: ${input.pageUrl}` : null,
      input.assignedUserName ? `Asesor: ${input.assignedUserName}` : null,
    ]
      .filter(Boolean)
      .join(' · ');
    const body = {
      full_name: input.name.trim(),
      email: input.email.trim(),
      phone: (input.phone ?? '').trim(),
      body: `${intentPrefix}${input.message.trim()}${extras ? `\n\n${extras}` : ''}`,
      property_id: input.propertyId ?? null,
      source: input.source ?? input.site ?? 'avalon_web',
    };
    return postJson(legacyUrl, key, body);
  }

  const extras = [
    input.propertyTitle ? `Propiedad: ${input.propertyTitle}` : null,
    input.propertyCode ? `Código: ${input.propertyCode}` : null,
    input.pageUrl ? `URL: ${input.pageUrl}` : null,
    input.assignedUserName ? `Asesor: ${input.assignedUserName}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const composed = `${intentPrefix}${input.message.trim()}${extras ? `\n\n${extras}` : ''}`;

  return submitConsultaViaLeadAdapters(
    {
      ...input,
      source: input.source ?? input.site,
    },
    composed,
  );
}
