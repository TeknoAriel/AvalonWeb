import Link from 'next/link';

export function FinalCtaSection() {
  return (
    <section className="border-t border-premier-line/50 bg-brand-primary py-24 text-brand-surface md:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center md:px-8">
        <h2 className="font-serif text-3xl font-medium md:text-4xl">Hablemos de su próximo activo</h2>
        <p className="mt-6 text-sm leading-relaxed text-brand-surface/75 md:text-base">
          Agenda confidencial con un asesor. Evaluamos encaje, timing y estructura de la operación sin
          compromiso inicial.
        </p>
        <Link
          href="/contacto"
          className="mt-10 inline-block border border-premier-gold px-10 py-4 text-[11px] font-medium uppercase tracking-caps text-brand-surface transition duration-400 hover:bg-premier-gold/15"
        >
          Coordinar conversación
        </Link>
      </div>
    </section>
  );
}
