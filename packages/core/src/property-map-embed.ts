import type { NormalizedProperty } from '@avalon/types';

function addressQueryParts(property: NormalizedProperty): string[] {
  const { location } = property;
  return [location.address, location.zone, location.zoneSecondary, location.city, location.region, location.country]
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter(Boolean);
}

/** Enlace externo “Abrir en Google Maps” cuando el embed no es viable. */
export function getPropertyMapsSearchUrl(property: NormalizedProperty): string | null {
  const parts = addressQueryParts(property);
  if (parts.length === 0) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(', '))}`;
}

/**
 * URL de iframe de Google Maps para la ficha de una propiedad.
 * - Con coordenadas y sin ocultar ubicación exacta: pin por lat/lng.
 * - Si no: búsqueda por dirección + ciudad (aproximada; útil cuando el feed no trae coordenadas).
 */
export function getPropertyMapEmbedSrc(property: NormalizedProperty): string | null {
  const { location } = property;
  if (
    location.latitude != null &&
    location.longitude != null &&
    !location.hideExactLocation
  ) {
    return `https://maps.google.com/maps?q=${location.latitude},${location.longitude}&z=15&output=embed`;
  }

  const parts = addressQueryParts(property);
  if (parts.length === 0) return null;

  const q = encodeURIComponent(parts.join(', '));
  return `https://maps.google.com/maps?q=${q}&z=14&output=embed`;
}

export function propertyMapLocationNote(property: NormalizedProperty): string | null {
  if (property.location.hideExactLocation) {
    return 'Ubicación aproximada por dirección (sin pin exacto por privacidad).';
  }
  if (
    property.location.latitude == null ||
    property.location.longitude == null
  ) {
    return 'Ubicación aproximada por dirección (el feed no incluye coordenadas).';
  }
  return null;
}
