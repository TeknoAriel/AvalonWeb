'use client';

import { cn } from '@avalon/utils';
import { useState } from 'react';

type Variant = 'avalon' | 'premier';

export function PropertyConsultaForm(props: { propertyId?: number; variant: Variant }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const isPremier = props.variant === 'premier';
  const isProperty =
    typeof props.propertyId === 'number' &&
    Number.isFinite(props.propertyId) &&
    props.propertyId > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (hp) return;
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
          message,
          ...(isProperty ? { propertyId: props.propertyId } : {}),
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
              ? 'Consulta por esta propiedad'
              : 'Enviá tu consulta'
            : isPremier
              ? 'Consulta general'
              : 'Escribinos'}
        </p>
        <p className={cn('mt-1 text-xs', isPremier ? 'text-brand-text/50' : 'text-brand-muted')}>
          Respondemos a la brevedad. Los datos no se publican en la web.
        </p>
      </div>

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
          placeholder={isPremier ? 'Quisiera más información…' : 'Escribí tu consulta…'}
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
        {status === 'loading' ? 'Enviando…' : 'Enviar consulta'}
      </button>

      {status === 'ok' ? (
        <p className={cn('text-sm', isPremier ? 'text-brand-accent' : 'text-green-700')}>
          Recibimos tu mensaje. Te contactamos pronto.
        </p>
      ) : null}
      {status === 'err' ? <p className="text-sm text-red-600">{errMsg}</p> : null}
    </form>
  );
}
