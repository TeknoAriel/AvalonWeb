/**
 * Provider de datos desde el feed / JSON empaquetado (fallback y compatibilidad offline).
 * Delega en @avalon/core; la UI Premier consume siempre modelos normalizados o PremierProperty.
 */
import { getSiteProperties } from '@avalon/core';
import type { NormalizedProperty, SiteType } from '@avalon/types';

export function getPropertiesFromKitepropFeed(site: SiteType): NormalizedProperty[] {
  return getSiteProperties(site);
}
