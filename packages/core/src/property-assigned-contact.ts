export type PropertyAssignedContactSource = 'assigned_user' | 'user' | 'agent' | 'broker' | 'fallback';

export type PropertyAssignedContact = {
  id: number | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  phone_whatsapp: string | null;
};

export type PropertyAssignedContactResolved = PropertyAssignedContact & {
  source: PropertyAssignedContactSource;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : null;
}

function clean(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

function numOrNull(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v) && v > 0) return Math.trunc(v);
  if (typeof v === 'string') {
    const n = Number.parseInt(v.trim(), 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

function contactFromCandidate(candidate: unknown): PropertyAssignedContact | null {
  const r = asRecord(candidate);
  if (!r) return null;

  const full_name = clean(r.full_name) ?? clean(r.name) ?? '';
  const email = clean(r.email);
  const phone_whatsapp = clean(r.phone_whatsapp);
  const phone = clean(r.phone);
  const id = numOrNull(r.id) ?? numOrNull(r.user_id);

  const hasAnyValue = Boolean(full_name || email || phone || phone_whatsapp || id);
  if (!hasAnyValue) return null;

  return {
    id,
    full_name,
    email,
    phone,
    phone_whatsapp,
  };
}

function fallbackContact(
  fallback?: Partial<PropertyAssignedContact> | null,
): PropertyAssignedContactResolved {
  return {
    id: numOrNull(fallback?.id) ?? null,
    full_name: clean(fallback?.full_name) ?? 'Equipo Avalon',
    email: clean(fallback?.email),
    phone: clean(fallback?.phone),
    phone_whatsapp: clean(fallback?.phone_whatsapp),
    source: 'fallback',
  };
}

export function resolvePropertyAssignedContact(
  property: unknown,
  fallback?: Partial<PropertyAssignedContact> | null,
): PropertyAssignedContactResolved {
  const r = asRecord(property);
  if (!r) return fallbackContact(fallback);

  const assignedUser = contactFromCandidate(r.assigned_user);
  if (assignedUser) return { ...assignedUser, source: 'assigned_user' };

  const user = contactFromCandidate(r.user);
  if (user) return { ...user, source: 'user' };

  const agent = contactFromCandidate(r.agent);
  if (agent) return { ...agent, source: 'agent' };

  const broker = contactFromCandidate(r.broker);
  if (broker) return { ...broker, source: 'broker' };

  return fallbackContact(fallback);
}

export function getPropertyAssignedContact(
  property: unknown,
  fallback?: Partial<PropertyAssignedContact> | null,
): PropertyAssignedContact {
  const resolved = resolvePropertyAssignedContact(property, fallback);
  return {
    id: resolved.id,
    full_name: resolved.full_name,
    email: resolved.email,
    phone: resolved.phone,
    phone_whatsapp: resolved.phone_whatsapp,
  };
}

export function getPropertyCode(property: unknown): string | null {
  const r = asRecord(property);
  if (!r) return null;

  const raw =
    clean(r.property_code) ??
    clean(r.code) ??
    clean(r.reference) ??
    clean(r.reference_code) ??
    clean(r.public_id);
  if (raw) return raw;

  const id = numOrNull(r.id);
  return id ? String(id) : null;
}
