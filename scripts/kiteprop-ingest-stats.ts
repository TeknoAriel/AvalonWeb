/**
 * Paso 1 — Verificación KiteProp: cantidad de filas del feed API y cuántas marcan Premier (`hasPremierTag`).
 *
 * Requiere en el entorno: `KITEPROP_API_KEY` o `KITEPROP_API_TOKEN` (igual que en Vercel).
 *
 *   export KITEPROP_API_KEY='kp_…'
 *   pnpm kp:ingest-stats
 *
 * CI: opcional `INGEST_STATS_OUT=ruta.json` escribe el mismo JSON en disco (artefacto).
 * Umbral estricto opcional: `MIN_PREMIER_TAG_COUNT=28` falla si hay menos Premier detectados.
 */
import { writeFile } from 'node:fs/promises';

import {
  fetchKitepropPropertyFeedAsRaw,
  hasPremierSavedListMembership,
  hasPremierTag,
  isPremierSiteListable,
  isPubliclyListedForSite,
  kitepropApiFeedConfigured,
  premierSavedListIdSet,
} from '@avalon/core';

async function main(): Promise<void> {
  if (!kitepropApiFeedConfigured()) {
    console.error('Falta KITEPROP_API_KEY o KITEPROP_API_TOKEN en el entorno.');
    process.exit(2);
  }

  const raw = await fetchKitepropPropertyFeedAsRaw({ cache: 'no-store' } as RequestInit);
  if (!raw || raw.length === 0) {
    console.error('La API devolvió 0 filas o el fetch falló (revisá key y red).');
    process.exit(1);
  }

  let premierTagCount = 0;
  let premierListableCount = 0;
  let avalonListableCount = 0;
  let premierSavedListRowCount = 0;
  for (const r of raw) {
    if (hasPremierSavedListMembership(r)) premierSavedListRowCount += 1;
    if (hasPremierTag(r)) premierTagCount += 1;
    if (isPremierSiteListable(r)) premierListableCount += 1;
    if (isPubliclyListedForSite(r, 'avalon')) avalonListableCount += 1;
  }

  const listIds = premierSavedListIdSet();

  const statusHistogram: Record<string, number> = {};
  for (const r of raw) {
    const k = String(r.status ?? '').trim() || '(vacío)';
    statusHistogram[k] = (statusHistogram[k] ?? 0) + 1;
  }

  const sortedStatuses = Object.fromEntries(
    Object.entries(statusHistogram).sort((a, b) => b[1] - a[1]),
  );

  const report = {
    totalRows: raw.length,
    /** Si definiste `KITEPROP_PREMIER_SAVED_LIST_IDS`, cuántas filas del feed traen ese id en campos conocidos. */
    premierSavedListIdsConfigured: listIds.size > 0,
    premierSavedListRowCount,
    premierTagCount,
    /** Cuántas vería el listado Premier (segmento + no terminal). */
    premierListableCount,
    /** Cuántas vería el listado Avalon Web (`isPubliclyListedForSite` sitio avalon). */
    avalonListableCount,
    statusHistogram: sortedStatuses,
    generatedAt: new Date().toISOString(),
  };

  const outPath = process.env.INGEST_STATS_OUT?.trim();
  if (outPath) {
    await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }

  console.log(JSON.stringify(report, null, 2));

  const minPrem = process.env.MIN_PREMIER_TAG_COUNT?.trim();
  if (minPrem) {
    const n = Number.parseInt(minPrem, 10);
    if (Number.isFinite(n) && premierTagCount < n) {
      console.error(`premierTagCount (${premierTagCount}) < MIN_PREMIER_TAG_COUNT (${n})`);
      process.exit(1);
    }
  }

  const minTotal = Number.parseInt(process.env.MIN_INGEST_TOTAL_ROWS ?? '1', 10);
  if (Number.isFinite(minTotal) && raw.length < minTotal) {
    console.error(`totalRows (${raw.length}) < MIN_INGEST_TOTAL_ROWS (${minTotal})`);
    process.exit(1);
  }
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
