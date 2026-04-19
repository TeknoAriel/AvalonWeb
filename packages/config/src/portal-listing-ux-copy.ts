/**
 * Copy centralizado — listado / ficha / continuidad de búsqueda (Avalon Web / portal).
 * No incluye lógica; solo strings para mantener tono sobrio y consistente.
 */
export const PORTAL_LISTING_UX_COPY = {
  searchContextSummary: {
    prefix: 'Tu búsqueda:',
    separator: ' · ',
    atLeastBeds: (n: number) => `${n}+ dormitorios`,
    atLeastBaths: (n: number) => `${n}+ baños`,
    priceRange: (min: string, max: string) => `${min} – ${max}`,
    priceFrom: (min: string) => `desde ${min}`,
    priceTo: (max: string) => `hasta ${max}`,
    withParking: 'con cochera',
    withCredit: 'apto crédito',
    textQuery: (q: string) => `“${q}”`,
  },
  fitInsightVariants: {
    multiMatch: 'Coincide con varios de los criterios que marcaste en el listado.',
    zoneStrong: 'Se destaca por ubicación y encaje con la zona que venías filtrando.',
    priceBand: 'Encaja en el rango de precio que estabas considerando.',
    typeAndSize: 'Tipo de propiedad y superficie alineados con lo que buscabas.',
    bedsOk: 'Dormitorios suficientes respecto al mínimo que pediste.',
    defaultHint: 'Buena opción para seguir evaluando dentro de tu búsqueda actual.',
  },
  similarSection: {
    title: 'Otras opciones que encajan con tu búsqueda',
    subtitle: 'Comparten ubicación, rango o características similares.',
  },
  similarTags: {
    cheaper: 'Más económica',
    largerM2: 'Mayor superficie',
    outdoor: 'Con patio',
    newListing: 'Nueva',
    newConstruction: 'A estrenar',
    sameZone: 'Mejor ubicación',
    betterValueM2: 'Mejor relación m² / precio',
  },
  cta: {
    consultThisProperty: 'Consultar esta propiedad',
    scheduleVisit: 'Agendar visita',
    moreInfo: 'Quiero más información',
    call: 'Llamar',
  },
  listingHighlight: {
    badge: 'La estabas viendo',
  },
  backToResults: 'Volver a resultados',
} as const;
