/**
 * Desactivar funciones puntuales sin deploy de código:
 * `NEXT_PUBLIC_DISABLED_FEATURES=favorites,recents` (coma, sin espacios obligatorios).
 */
export type AvalonFeatureId =
  | 'favorites'
  | 'recents'
  | 'saved_search'
  | 'compare_insights'
  | 'smart_related'
  | 'nl_search'
  | 'lead_intent'
  | 'extended_filters'
  | 'property_ask'
  | 'market_summary';

function disabledSet(): Set<string> {
  const raw =
    typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_DISABLED_FEATURES ?? '' : '';
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

export function isFeatureEnabled(id: AvalonFeatureId): boolean {
  if (disabledSet().has(id)) return false;
  /** NL desactivado por defecto en listados; activar con `NEXT_PUBLIC_ENABLE_NL_SEARCH=1`. */
  if (id === 'nl_search') {
    return typeof process !== 'undefined' && process.env.NEXT_PUBLIC_ENABLE_NL_SEARCH === '1';
  }
  return true;
}
