'use client';

import { isFeatureEnabled } from '@avalon/config';
import { cn, trackAvalonEvent } from '@avalon/utils';
import { useEffect, useState } from 'react';

type Variant = 'avalon' | 'premier';
type SiteSource = 'avalon-propiedades' | 'avalon-premier';

type PropertyInquiryContext = {
  property_id: number;
  property_code?: string | null;
  property_title?: string;
  site?: SiteSource;
  assigned_user_id?: number | null;
  user_id?: number | null;
  assigned_user_name?: string | null;
  contact_phone?: string | null;
  contact_whatsapp?: string | null;
};

const LEAD_INTENTS_AVALON: { id: string; label: string }[] = [
  { id: 'visita', label: 'Coordinar visita' },
  { id: 'contacto', label: 'Que me contacten' },
  { id: 'similar', label: 'Busco algo similar' },
  { id: 'zona', label: 'Invertir en esta zona' },
  { id: 'tasacion', label: 'Tasar una propiedad parecida' },
];

/** Mismos `id` (payload / analytics); copy más sobrio para Premier. */
const LEAD_INTENTS_PREMIER: { id: string; label: string }[] = [
  { id: 'visita', label: 'Coordinar visita' },
  { id: 'contacto', label: 'Solicitar información' },
  { id: 'similar', label: 'Ver opciones similares' },
  { id: 'zona', label: 'Consultar por la zona' },
  { id: 'tasacion', label: 'Orientación de valor' },
];

export function PropertyConsultaForm(props: {
  propertyId?: number;
  variant: Variant;
  propertyContext?: PropertyInquiryContext;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');
  const [leadIntent, setLeadIntent] = useState<string | undefined>();
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') setPageUrl(window.location.href);
  }, []);

  const isPremier = props.variant === 'premier';
  const leadIntents = isPremier ? LEAD_INTENTS_PREMIER : LEAD_INTENTS_AVALON;
  const context = props.propertyContext;
  const effectivePropertyId = context?.property_id ?? props.propertyId;
  const isProperty =
    typeof effectivePropertyId === 'number' &&
    Number.isFinite(effectivePropertyId) &&
    effectivePropertyId > 0;
  const sourceSite: SiteSource = context?.site ?? (isPremier ? 'avalon-premier' : 'avalon-propiedades');
  const waDigits = (context?.contact_whatsapp ?? context?.contact_phone ?? '').replace(/\D/g, '');
  const waPrefill = [
    `Hola, me interesa la propiedad ${context?.property_title ?? 'publicada en Avalon'}.`,
    context?.property_code ? `Código: ${context.property_code}.` : null,
    pageUrl ? `URL: ${pageUrl}` : null,
    name.trim() ? `Soy ${name.trim()}.` : null,
    'Quedo atento/a a más información.',
  ]
    .filter(Boolean)
    .join(' ');
  const whatsappHref = waDigits ? `https://wa.me/${waDigits}?text=${encodeURIComponent(waPrefill)}` : null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (hp) return;
    let effectiveMessage = message.trim();
    const intentLabel = leadIntents.find((x) => x.id === leadIntent)?.label;
    if (effectiveMessage.length < 5 && intentLabel) {
      effectiveMessage = `${intentLabel}. ${effectiveMessage}`.trim();
    }
    if (effectiveMessage.length < 5) {
      setErrMsg('El mensaje es demasiado corto.');
      return;
    }
    setStatus('loading');
    setErrMsg('');
    try {
      const res = await fetch('/api/consultas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          message: effectiveMessage,
          ...(isProperty
            ? {
                property_id: effectivePropertyId,
                property_code: context?.property_code ?? null,
                property_title: context?.property_title ?? null,
                site: sourceSite,
                page_url: pageUrl || null,
                assigned_user_id: context?.assigned_user_id ?? null,
                user_id: context?.user_id ?? null,
                assigned_user_name: context?.assigned_user_name ?? null,
              }
            : {
                site: sourceSite,
                page_url: pageUrl || null,
              }),
          ...(isProperty ? { propertyId: effectivePropertyId } : {}),
          ...(leadIntent ? { leadIntentId: leadIntent } : {}),
          ...(intentLabel ? { leadIntent: intentLabel } : {}),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (!res.ok || !data.ok) {
        setStatus('err');
        setErrMsg(
          typeof data.message === 'string' && data.message
            ? data.message
            : 'No se pudo enviar. Intentá más tarde o usá WhatsApp.',
        );
        return;
      }
      setStatus('ok');
      setMessage('');
      trackAvalonEvent(
        'consultation_created',
        isProperty ? { property_id: props.propertyId! } : { scope: 'general' },
      );
    } catch {
      setStatus('err');
      setErrMsg('Error de red.');
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'space-y-4 rounded-xl border p-5',
        isPremier
          ? 'border-premier-line/50 bg-brand-surface-alt/30'
          : 'border-brand-primary/10 bg-white shadow-sm',
      )}
    >
      <div>
        <p
          className={cn(
            'font-semibold',
            isPremier ? 'font-serif text-sm text-brand-primary' : 'text-sm text-brand-primary',
          )}
        >
          {isProperty
            ? isPremier
              ? 'Solicitud por esta propiedad'
              : 'Enviá tu consulta'
            : isPremier
              ? 'Mensaje al equipo'
              : 'Escribinos'}
        </p>
        <p className={cn('mt-1 text-xs', isPremier ? 'text-brand-text/50' : 'text-brand-muted')}>
          {isPremier
            ? 'Respuesta en horario comercial. Los datos no se publican.'
            : 'Respondemos a la brevedad. Los datos no se publican en la web.'}
        </p>
      </div>

      {isProperty && isFeatureEnabled('lead_intent') ? (
        <div className="flex flex-wrap gap-2">
          <span className={cn('w-full text-[11px] font-semibold', isPremier ? 'text-brand-text/55' : 'text-brand-muted')}>
            Motivo (opcional)
          </span>
          {leadIntents.map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={() => {
                setLeadIntent((cur) => (cur === it.id ? undefined : it.id));
                trackAvalonEvent('lead_intent_selected', { intent: it.id });
              }}
              className={cn(
                'rounded-full border px-2.5 py-1 text-[11px] font-medium transition',
                leadIntent === it.id
                  ? isPremier
                    ? 'border-brand-accent bg-brand-accent/15 text-brand-primary'
                    : 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                  : isPremier
                    ? 'border-premier-line/40 text-brand-text/70 hover:border-brand-accent/50'
                    : 'border-brand-primary/15 text-brand-muted hover:border-brand-primary/35',
              )}
            >
              {it.label}
            </button>
          ))}
        </div>
      ) : null}

      <input
        type="text"
        name="website"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs">
          <span className={isPremier ? 'text-brand-text/60' : 'text-brand-muted'}>Nombre</span>
          <input
            required
            minLength={2}
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={cn(
              'mt-1 w-full border-b bg-transparent py-2 text-sm outline-none',
              isPremier
                ? 'border-premier-line/60 text-brand-primary placeholder:text-brand-text/35'
                : 'border-brand-primary/20 text-brand-text',
            )}
          />
        </label>
        <label className="block text-xs">
          <span className={isPremier ? 'text-brand-text/60' : 'text-brand-muted'}>Email</span>
          <input
            required
            type="email"
            maxLength={200}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(
              'mt-1 w-full border-b bg-transparent py-2 text-sm outline-none',
              isPremier
                ? 'border-premier-line/60 text-brand-primary placeholder:text-brand-text/35'
                : 'border-brand-primary/20 text-brand-text',
            )}
          />
        </label>
      </div>
      <label className="block text-xs">
        <span className={isPremier ? 'text-brand-text/60' : 'text-brand-muted'}>Teléfono (opcional)</span>
        <input
          type="tel"
          maxLength={40}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={cn(
            'mt-1 w-full border-b bg-transparent py-2 text-sm outline-none',
            isPremier
              ? 'border-premier-line/60 text-brand-primary placeholder:text-brand-text/35'
              : 'border-brand-primary/20 text-brand-text',
          )}
        />
      </label>
      <label className="block text-xs">
        <span className={isPremier ? 'text-brand-text/60' : 'text-brand-muted'}>Mensaje</span>
        <textarea
          required
          minLength={5}
          maxLength={2000}
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={cn(
            'mt-1 w-full resize-y border px-3 py-2 text-sm outline-none',
            isPremier
              ? 'border-premier-line/50 bg-brand-bg text-brand-text placeholder:text-brand-text/35'
              : 'border-brand-primary/15 bg-brand-surface text-brand-text',
          )}
          placeholder={isPremier ? 'Breve contexto de la solicitud…' : 'Escribí tu consulta…'}
        />
      </label>

      <button
        type="submit"
        disabled={status === 'loading'}
        className={cn(
          'w-full py-3 text-sm font-semibold transition disabled:opacity-60',
          isPremier
            ? 'border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-brand-surface'
            : 'rounded-md bg-brand-primary text-white hover:bg-brand-primary-mid',
        )}
      >
        {status === 'loading' ? 'Enviando…' : isPremier ? 'Enviar solicitud' : 'Enviar consulta'}
      </button>
      {isProperty && whatsappHref ? (
        <a
          href={whatsappHref}
          className={cn(
            'block w-full border py-2.5 text-center text-xs font-semibold transition',
            isPremier
              ? 'border-brand-accent/60 text-brand-accent hover:bg-brand-accent/10'
              : 'border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5',
          )}
        >
          WhatsApp
        </a>
      ) : null}

      {status === 'ok' ? (
        <p className={cn('text-sm', isPremier ? 'text-brand-accent' : 'text-green-700')}>
          Recibimos tu mensaje. Te contactamos pronto.
        </p>
      ) : null}
      {status === 'err' ? <p className="text-sm text-red-600">{errMsg}</p> : null}
    </form>
  );
}
