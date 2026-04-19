/**
 * Comprueba que el snapshot del repo tenga al menos una fila listable en Premier.
 * No llama a la API (solo datos empaquetados); sirve de red de seguridad en CI.
 *
 * Si `pnpm check:premier-snapshot` falla con EPERM en un sandbox, ejecutalo fuera (p. ej. `all` en Cursor o terminal local).
 */
import {
  ALL_RAW_PROPERTIES,
  getSitePropertiesFromRaw,
  hasPremierTag,
  isPremierSiteListable,
} from '@avalon/core';

const premier = getSitePropertiesFromRaw('premier', ALL_RAW_PROPERTIES);
const avalon = getSitePropertiesFromRaw('avalon', ALL_RAW_PROPERTIES);

const raw = ALL_RAW_PROPERTIES.length;
const tagRows = ALL_RAW_PROPERTIES.filter((r) => hasPremierTag(r)).length;
const listableRows = ALL_RAW_PROPERTIES.filter((r) => isPremierSiteListable(r)).length;

console.log(
  `[check-premier-snapshot] raw=${raw} premierListable(normalized)=${premier.length} avalon=${avalon.length} | raw: hasPremierTag=${tagRows} isPremierSiteListable=${listableRows}`,
);

if (premier.length === 0) {
  if (tagRows > 0) {
    console.error(
      `[check-premier-snapshot] FAIL: el snapshot tiene ${tagRows} fila(s) con segmento Premier (hasPremierTag) pero ` +
        `0 listables en sitio Premier (isPremierSiteListable). Suele deberse a status del feed vs reglas de listado, o a un snapshot desactualizado. ` +
        'Regenerá `packages/core/data/properties.json` con `pnpm catalog:regenerate-snapshot` (KITEPROP_API_KEY en el entorno). ' +
        'Ver docs/PREMIER_INVENTORY_INVARIANT.md.',
    );
  } else {
    console.error(
      '[check-premier-snapshot] FAIL: inventario Premier en snapshot es 0. ' +
        'Regenerá o enriquecé packages/core/data/properties.json, o revisá tags/flags Premier en la fuente. ' +
        'Ver docs/PREMIER_INVENTORY_INVARIANT.md. En producción también hace falta KITEPROP_API_KEY en Vercel (proyecto avalon-premier).',
    );
  }
  process.exit(1);
}

process.exit(0);
