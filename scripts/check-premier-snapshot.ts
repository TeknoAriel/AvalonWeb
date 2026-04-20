/**
 * Comprueba el snapshot empaquetado del repo (`properties.json`).
 * Con array vacío (catálogo solo por API en runtime) el check pasa con aviso.
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

if (raw === 0) {
  console.log(
    '[check-premier-snapshot] OK: snapshot vacío — el catálogo en runtime es solo API/BFF (ver docs/OPERACION.md).',
  );
  process.exit(0);
}

if (premier.length === 0) {
  if (tagRows > 0) {
    console.error(
      `[check-premier-snapshot] FAIL: el snapshot tiene ${tagRows} fila(s) con segmento Premier (hasPremierTag) pero ` +
        `0 listables en sitio Premier (isPremierSiteListable). Suele deberse a status del feed vs reglas de listado, o a un snapshot desactualizado. ` +
        'Podés vaciar `packages/core/data/properties.json` a `[]` o regenerar con `pnpm catalog:regenerate-snapshot`. ' +
        'Ver docs/PREMIER_INVENTORY_INVARIANT.md.',
    );
  } else {
    console.error(
      '[check-premier-snapshot] FAIL: inventario Premier en snapshot es 0 con filas en el archivo. ' +
        'Vacía el JSON a `[]` si usás solo API, o regenerá con `pnpm catalog:regenerate-snapshot`. ' +
        'Ver docs/PREMIER_INVENTORY_INVARIANT.md.',
    );
  }
  process.exit(1);
}

process.exit(0);
