const ITEMS = [
  {
    title: 'Confianza',
    body: 'Información clara, seguimiento ordenado y una comunicación directa durante todo el proceso. Cada operación se trabaja con seriedad, criterio y una atención realmente personalizada.',
  },
  {
    title: 'Experiencia',
    body: 'Años de trayectoria, conocimiento del mercado y una mirada práctica sobre cada operación. Acompañamos decisiones de compra, venta e inversión con criterio comercial y foco en resultado.',
  },
  {
    title: 'Oportunidades',
    body: 'Identificamos propiedades con valor real, buen posicionamiento y potencial de negocio. Analizamos cada caso con una mirada atenta sobre mercado, ubicación y proyección, tanto a nivel local como internacional.',
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
