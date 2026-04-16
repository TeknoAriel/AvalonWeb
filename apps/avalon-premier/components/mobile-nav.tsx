'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@avalon/utils';

export function MobileNav(props: { peerHref: string; peerCta: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-stone-400/35 bg-brand-primary text-brand-surface shadow-lg shadow-stone-900/25 md:hidden"
        onClick={() => setOpen((o) => !o)}
        aria-label="Menú"
      >
        ☰
      </button>
      <div
        className={cn('fixed inset-0 z-40 bg-stone-950/50 backdrop-blur-[2px] md:hidden', open ? 'block' : 'hidden')}
        onClick={() => setOpen(false)}
      />
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-premier-line/50 bg-brand-bg p-8 shadow-2xl md:hidden',
          open ? 'block' : 'hidden'
        )}
      >
        <ul className="space-y-3.5 text-center font-serif text-lg text-brand-primary">
          <li>
            <Link href="/" onClick={() => setOpen(false)}>
              Inicio
            </Link>
          </li>
          <li>
            <Link href="/propiedades" onClick={() => setOpen(false)}>
              Colección
            </Link>
          </li>
          <li>
            <Link href="/favoritos" onClick={() => setOpen(false)}>
              Favoritos
            </Link>
          </li>
          <li>
            <Link href="/propiedades/comparar" onClick={() => setOpen(false)}>
              Comparar
            </Link>
          </li>
          <li>
            <Link href="/institucional" onClick={() => setOpen(false)}>
              Experiencia
            </Link>
          </li>
          <li>
            <Link href="/contacto" onClick={() => setOpen(false)}>
              Contacto
            </Link>
          </li>
          <li>
            <Link href={props.peerHref} onClick={() => setOpen(false)}>
              {props.peerCta}
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
