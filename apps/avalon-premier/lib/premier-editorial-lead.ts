import type { NormalizedProperty } from '@avalon/types';

/** Frases breves, estables por ficha (sin repetir título ni dirección). */
const EDITORIAL_LEADS = [
  'Residencia de categoría en un entorno con alto estándar urbano.',
  'Propuesta para quienes priorizan amplitud, diseño y privacidad cotidiana.',
  'Propiedad de perfil superior en una ubicación de valor reconocido.',
  'Pieza pensada para exigencias residenciales elevadas, con lectura patrimonial clara.',
  'Marco residencial sobrio, con metros y terminaciones acordes a expectativas exigentes.',
] as const;

/** Texto editorial corto, determinístico por `id` (misma ficha → mismo tono en cada visita). */
export function premierEditorialLead(property: NormalizedProperty): string {
  const mix =
    property.id +
    property.location.city.length * 17 +
    (property.propertyType?.length ?? 0) * 23 +
    (property.title.length % 7);
  const idx = Math.abs(mix) % EDITORIAL_LEADS.length;
  return EDITORIAL_LEADS[idx]!;
}
