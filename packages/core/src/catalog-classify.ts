/**
 * Clasificación de catálogo (un solo lugar conceptual para imports).
 *
 * - **Segmento Premier:** `hasPremierTag` (tags, flags, listas guardadas vía env, overrides por ID).
 * - **Listable en sitio Premier:** `isPremierSiteListable` (segmento Premier y no cierre definitivo en `status`).
 * - **Listable Avalon:** `isPubliclyListedForSite(_, 'avalon')`.
 */
export { hasPremierTag, isPremierInventory } from './premier';
export { hasPremierSavedListMembership, premierSavedListIdSet } from './premier-list-membership';
export { isPremierSiteListable, isPubliclyListed, isPubliclyListedForSite } from './listing-rules';
