'use client';

import { isFeatureEnabled } from '@avalon/config';
import { cn, trackAvalonEvent } from '@avalon/utils';
import { useState } from 'react';

type Variant = 'avalon' | 'premier';

export function PropertyAskWidget(props: {
  propertyId: number;
  variant: Variant;
  siteKey: 'avalon' | 'premier';
}) {
  const enabled = isFeatureEnabled('property_ask');
  const [q, setQ] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!enabled) return null;

  const isPremier = props.variant === 'premier';

  async function ask() {
    const trimmed = q.trim();
    if (trimmed.length < 3) return;
    setLoading(true);
    setErr(null);
    setAnswer(null);
    trackAvalonEvent('property_question_submitted', { property_id: props.propertyId, site: props.siteKey });
    try {
      const res = await fetch('/api/ai/property-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: props.propertyId, question: trimmed }),
      });
      const data = (await res.json()) as { answer?: string; message?: string };
      if (!res.ok) {
        setErr(data.message ?? 'No disponible');
        return;
      }
      setAnswer(typeof data.answer === 'string' ? data.answer : '');
      trackAvalonEvent('property_question_answered', { property_id: props.propertyId, site: props.siteKey });
    } catch {
      setErr('Error de red. Probá de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={cn(
        'mt-6 rounded-xl border p-4',
        isPremier ? 'border-premier-line/40 bg-brand-bg/40' : 'border-brand-primary/10 bg-brand-surface-alt/40',
      )}
    >
      <p className={cn('text-xs font-semibold', isPremier ? 'text-brand-primary' : 'text-brand-primary')}>
        Preguntá por esta propiedad
      </p>
      <p className="mt-1 text-[11px] text-brand-muted">
        Respuesta automática con los datos publicados; un asesor puede ampliar el detalle.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask()}
          disabled={loading}
          placeholder="Ej.: ¿Tiene cochera? ¿Apto crédito?"
          className={cn(
            'min-h-[40px] flex-1 rounded-md border px-2 py-2 text-sm',
            isPremier ? 'border-premier-line/50 bg-brand-bg' : 'border-brand-primary/15 bg-white',
          )}
        />
        <button
          type="button"
          disabled={loading}
          onClick={ask}
          className={cn(
            'min-h-[40px] shrink-0 rounded-md px-3 text-xs font-semibold',
            isPremier ? 'border border-brand-accent text-brand-accent' : 'bg-brand-primary text-white',
          )}
        >
          {loading ? '…' : 'Preguntar'}
        </button>
      </div>
      {answer ? <p className="mt-3 text-sm leading-relaxed text-brand-text">{answer}</p> : null}
      {err ? <p className="mt-2 text-xs text-red-600">{err}</p> : null}
    </div>
  );
}
