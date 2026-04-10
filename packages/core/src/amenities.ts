import type { PropertyAmenity, RawProperty } from '@avalon/types';

/**
 * Amenities inferidas solo desde campos estructurados del JSON.
 * Si en el futuro el export incluye lista explícita, extender aquí.
 */
export function extractAmenities(raw: RawProperty): PropertyAmenity[] {
  const out: PropertyAmenity[] = [];

  if (raw.accept_pets === true) {
    out.push({ id: 'pets', label: 'Acepta mascotas', group: 'confort' });
  }
  if (raw.accept_barter === true) {
    out.push({ id: 'barter', label: 'Acepta permuta', group: 'operacion' });
  }
  if (raw.fit_for_credit === true) {
    out.push({ id: 'credit', label: 'Apto crédito hipotecario', group: 'operacion' });
  }
  if (raw.is_new_construction === true) {
    out.push({ id: 'new', label: 'A estrenar', group: 'edificio' });
  }
  if (raw.parkings > 0) {
    out.push({
      id: 'parking',
      label: raw.parkings === 1 ? 'Cochera' : `${raw.parkings} cocheras`,
      group: 'edificio',
    });
  }
  if (raw.half_bathrooms && raw.half_bathrooms > 0) {
    out.push({
      id: 'half-bath',
      label:
        raw.half_bathrooms === 1 ? 'Medio baño' : `${raw.half_bathrooms} medios baños`,
      group: 'confort',
    });
  }
  if (raw.uncovered_meters > 0) {
    out.push({
      id: 'uncovered',
      label: `Superficie descubierta ${raw.uncovered_meters} m²`,
      group: 'exteriores',
    });
  }
  if (raw.floors_in_building > 0 && raw.property_type === 'apartments') {
    out.push({
      id: 'building-floors',
      label: `Edificio de ${raw.floors_in_building} pisos`,
      group: 'edificio',
    });
  }

  return out;
}
