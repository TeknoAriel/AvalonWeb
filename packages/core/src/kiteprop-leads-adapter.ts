import type { KitepropConsultaInput, KitepropConsultaResult } from './kiteprop-consulta';
import { kitepropOutboundUserAgent } from './kiteprop-outbound';

type LeadAdapterResult =
  | { ok: true; status: number; leadId?: string | number | null }
  | { ok: false; status: number; message: string };

export type CreateOrUpsertLeadInput = {
  name: string;
  email: string;
  phone?: string;
  source?: string;
  summary: string;
};

export type AttachPropertyInquiryInput = {
  propertyId: number;
  email: string;
  body: string;
  phone?: string;
};

function apiKey(): string {
  return (process.env.KITEPROP_API_KEY || process.env.KITEPROP_API_TOKEN || '').trim();
}

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

async function postJson(url: string, body: Record<string, unknown>): Promise<LeadAdapterResult> {
  const key = apiKey();
  if (!key) return { ok: false, status: 503, message: 'KITEPROP_API_KEY no configurada.' };

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
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      return { ok: false, status: res.status, message: text.slice(0, 500) };
    }
    const json = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    return {
      ok: true,
      status: res.status,
      leadId:
        (json?.id as string | number | undefined) ??
        (json?.contact_id as string | number | undefined) ??
        null,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'fetch error';
    return { ok: false, status: 0, message: msg };
  }
}

export async function createOrUpsertLead(input: CreateOrUpsertLeadInput): Promise<LeadAdapterResult> {
  const root = resolveKitepropApiRoot();
  const { first_name, last_name } = splitName(input.name);
  const payload: Record<string, unknown> = {
    first_name,
    email: input.email.trim(),
    summary: input.summary.trim(),
    source: input.source ?? 'Web Avalon',
  };
  if (last_name) payload.last_name = last_name;
  if (input.phone?.trim()) payload.phone = input.phone.trim();
  return postJson(`${root}/api/v1/contacts`, payload);
}

export async function attachPropertyInquiry(
  input: AttachPropertyInquiryInput,
): Promise<LeadAdapterResult> {
  const root = resolveKitepropApiRoot();
  const payload: Record<string, unknown> = {
    email: input.email.trim(),
    body: input.body.trim(),
    property_id: input.propertyId,
  };
  if (input.phone?.trim()) payload.phone = input.phone.trim();
  return postJson(`${root}/api/v1/messages`, payload);
}

/**
 * Placeholder para endpoint final de asignación en KiteProp.
 * No inventamos endpoint: queda desacoplado para conectar cuando soporte confirme contrato.
 */
export async function assignLeadToUser(_userId?: number): Promise<LeadAdapterResult> {
  return { ok: true, status: 202, leadId: null };
}

export async function submitConsultaViaLeadAdapters(
  input: KitepropConsultaInput,
  composedMessage: string,
): Promise<KitepropConsultaResult> {
  const pid = input.propertyId;
  const hasProperty = pid != null && Number.isFinite(pid) && typeof pid === 'number' && pid > 0;

  if (hasProperty) {
    const attach = await attachPropertyInquiry({
      propertyId: pid,
      email: input.email.trim(),
      body: composedMessage,
      phone: input.phone,
    });
    if (!attach.ok) return attach;
    const assign = await assignLeadToUser(input.assignedUserId ?? input.userId ?? undefined);
    if (!assign.ok) return assign;
    return { ok: true, status: attach.status };
  }

  const lead = await createOrUpsertLead({
    name: input.name,
    email: input.email,
    phone: input.phone,
    source: input.source ?? 'Web Avalon',
    summary: composedMessage,
  });
  if (!lead.ok) return lead;
  const assign = await assignLeadToUser(input.assignedUserId ?? input.userId ?? undefined);
  if (!assign.ok) return assign;
  return { ok: true, status: lead.status };
}
