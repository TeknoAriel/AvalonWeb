const ITEMS = [
  {
    title: 'Confianza',
    body: 'Información verificada, tiempos acordados y comunicación clara con un único interlocutor senior.',
  },
  {
    title: 'Experiencia',
    body: 'Procesos de compra y venta diseñados para patrimonios exigentes, con foco en resultado y privacidad.',
  },
  {
    title: 'Discreción',
    body: 'Listados sensibles bajo criterio de exposición. Visitas coordinadas y acuerdos de confidencialidad cuando corresponde.',
  },
] as const;

export function DifferentiatorsSection() {
  return (
    <section className="bg-brand-surface-alt/50 py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <p className="text-center text-[11px] font-medium uppercase tracking-caps text-brand-accent">
          Por qué Premier
        </p>
        <h2 className="mt-5 text-center font-serif text-3xl font-medium text-brand-primary md:text-4xl">
          Tres pilares
        </h2>
        <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10">
          {ITEMS.map((item) => (
            <div key={item.title} className="text-center md:text-left">
              <h3 className="font-serif text-xl text-brand-primary">{item.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-brand-text/65">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
