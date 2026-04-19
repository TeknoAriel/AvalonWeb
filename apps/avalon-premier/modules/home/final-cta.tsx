import Link from 'next/link';

export function FinalCtaSection() {
  return (
    <section className="border-t border-premier-line/40 bg-gradient-to-b from-brand-primary to-[#0e1524] py-28 text-stone-100 md:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center md:px-8">
        <h2 className="font-serif text-3xl font-normal tracking-tight md:text-4xl">
          Próximo paso, con calma
        </h2>
        <p className="mt-8 text-sm font-light leading-[1.85] text-stone-300/95 md:text-base">
          Agenda reservada con el equipo: encaje, timing y estructura de la operación, sin presión comercial.
        </p>
        <Link
          href="/contacto"
          className="mt-12 inline-block border border-stone-400/35 px-10 py-3.5 text-[11px] font-medium uppercase tracking-caps text-stone-50 transition duration-300 hover:border-stone-300/50 hover:bg-white/[0.06]"
        >
          Hablar con un asesor
        </Link>
      </div>
    </section>
  );
}
