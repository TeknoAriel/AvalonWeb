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
    <section className="border-t border-premier-line/35 bg-brand-bg py-28 md:py-36">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <p className="text-center text-[11px] font-medium uppercase tracking-caps text-brand-accent/90">
          Por qué Premier
        </p>
        <h2 className="mt-6 text-center font-serif text-3xl font-normal tracking-tight text-brand-primary md:text-4xl">
          Tres pilares
        </h2>
        <div className="mt-20 grid gap-14 md:grid-cols-3 md:gap-0 md:divide-x md:divide-premier-line/45">
          {ITEMS.map((item) => (
            <div key={item.title} className="text-center md:px-10 md:text-left">
              <h3 className="font-serif text-xl font-normal tracking-tight text-brand-primary">{item.title}</h3>
              <p className="mt-5 text-sm font-light leading-[1.85] text-brand-text/62">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
