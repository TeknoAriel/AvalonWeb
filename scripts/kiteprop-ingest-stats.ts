/**
 * Paso 1 — Verificación KiteProp: cantidad de filas del feed API y cuántas marcan Premier (`hasPremierTag`).
 *
 * Requiere en el entorno: `KITEPROP_API_KEY` o `KITEPROP_API_TOKEN` (igual que en Vercel).
 *
 *   export KITEPROP_API_KEY='kp_…'
 *   pnpm kp:ingest-stats
 */
import {
  fetchKitepropPropertyFeedAsRaw,
  hasPremierTag,
  kitepropApiFeedConfigured,
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
  for (const r of raw) {
    if (hasPremierTag(r)) premierTagCount += 1;
  }

  const statusHistogram: Record<string, number> = {};
  for (const r of raw) {
    const k = String(r.status ?? '').trim() || '(vacío)';
    statusHistogram[k] = (statusHistogram[k] ?? 0) + 1;
  }

  const sortedStatuses = Object.fromEntries(
    Object.entries(statusHistogram).sort((a, b) => b[1] - a[1]),
  );

  console.log(
    JSON.stringify(
      {
        totalRows: raw.length,
        premierTagCount,
        statusHistogram: sortedStatuses,
      },
      null,
      2,
    ),
  );
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
