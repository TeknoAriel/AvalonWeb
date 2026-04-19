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
  let premierTaggedAvalonListable = 0;
  let premierTaggedNotAvalonListable = 0;
  let premierTaggedTerminalOnly = 0;
  for (const r of raw) {
    if (hasPremierSavedListMembership(r)) premierSavedListRowCount += 1;
    const tag = hasPremierTag(r);
    const avalonOk = isPubliclyListedForSite(r, 'avalon');
    const premierOk = isPremierSiteListable(r);
    if (tag) {
      premierTagCount += 1;
      if (avalonOk) premierTaggedAvalonListable += 1;
      else premierTaggedNotAvalonListable += 1;
      if (!premierOk) premierTaggedTerminalOnly += 1;
    }
    if (premierOk) premierListableCount += 1;
    if (avalonOk) avalonListableCount += 1;
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

  const statusAmongPremierTagged: Record<string, number> = {};
  for (const r of raw) {
    if (!hasPremierTag(r)) continue;
    const k = String(r.status ?? '').trim() || '(vacío)';
    statusAmongPremierTagged[k] = (statusAmongPremierTagged[k] ?? 0) + 1;
  }
  const sortedPremierTaggedStatuses = Object.fromEntries(
    Object.entries(statusAmongPremierTagged).sort((a, b) => b[1] - a[1]),
  );

  const apiBaseResolved =
    process.env.KITEPROP_API_BASE_URL?.trim() ||
    process.env.KITEPROP_API_URL?.trim() ||
    '(default https://www.kiteprop.com/api/v1)';

  const report = {
    totalRows: raw.length,
    /** URL base usada para GET /properties (BASE tiene prioridad sobre API_URL). */
    kitepropApiBaseResolved: apiBaseResolved,
    /** Si definiste `KITEPROP_PREMIER_SAVED_LIST_IDS`, cuántas filas del feed traen ese id en campos conocidos. */
    premierSavedListIdsConfigured: listIds.size > 0,
    premierSavedListRowCount,
    premierTagCount,
    /** Cuántas vería el listado Premier (segmento + no terminal). */
    premierListableCount,
    /** Cuántas vería el listado Avalon Web (`isPubliclyListedForSite` sitio avalon = estados “activos” tipo publicación). */
    avalonListableCount,
    /** Total − listables Avalon (no entran al listado estándar Avalon por `status`). */
    avalonNotListableCount: raw.length - avalonListableCount,
    /** Con tag Premier y además listables en Avalon (activas/publicadas a la manera Avalon). */
    premierTaggedAndAvalonListableCount: premierTaggedAvalonListable,
    /** Con tag Premier pero estado no considerado listable en Avalon. */
    premierTaggedButNotAvalonListableCount: premierTaggedNotAvalonListable,
    /** Con tag Premier pero no en sitio Premier (p. ej. sold/archived/reserved…). */
    premierTaggedExcludedFromPremierSiteCount: premierTaggedTerminalOnly,
    statusHistogramAllRows: sortedStatuses,
    statusHistogramPremierTaggedOnly: sortedPremierTaggedStatuses,
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
