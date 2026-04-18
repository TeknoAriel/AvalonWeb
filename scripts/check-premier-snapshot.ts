/**
 * Comprueba que el snapshot del repo tenga al menos una fila listable en Premier.
 * No llama a la API (solo datos empaquetados); sirve de red de seguridad en CI.
 */
import { ALL_RAW_PROPERTIES, getSitePropertiesFromRaw } from '@avalon/core';

const premier = getSitePropertiesFromRaw('premier', ALL_RAW_PROPERTIES);
const avalon = getSitePropertiesFromRaw('avalon', ALL_RAW_PROPERTIES);

const raw = ALL_RAW_PROPERTIES.length;
console.log(`[check-premier-snapshot] raw=${raw} premier=${premier.length} avalon=${avalon.length}`);

if (premier.length === 0) {
  console.error(
    '[check-premier-snapshot] FAIL: inventario Premier en snapshot es 0. ' +
      'Regenerá o enriquecé packages/core/data/properties.json, o revisá tags/flags Premier en la fuente. ' +
      'Ver docs/PREMIER_INVENTORY_INVARIANT.md. En producción también hace falta KITEPROP_API_KEY en Vercel (proyecto avalon-premier).',
  );
  process.exit(1);
}

process.exit(0);
