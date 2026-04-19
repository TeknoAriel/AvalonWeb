/**
 * Regenera `packages/core/data/properties.json` desde la API KiteProp (mismo pipeline que producción).
 *
 *   export KITEPROP_API_KEY='kp_…'
 *   pnpm catalog:regenerate-snapshot
 *
 * Si existe `.env.local` o `.env` en la raíz del monorepo, se cargan claves aún no definidas en el proceso
 * (solo líneas `KEY=valor`, sin sintaxis multilinea).
 *
 * Opcional: `KITEPROP_API_BASE_URL`, `KITEPROP_API_STATUS_FILTER`, etc. (ver docs/KITEPROP.md).
 */
import { existsSync, readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { fetchKitepropPropertyFeedAsRaw, kitepropApiFeedConfigured } from '@avalon/core';

function loadDotEnvFile(rel: string): void {
  const p = join(process.cwd(), rel);
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i <= 0) continue;
    const key = t.slice(0, i).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

async function main(): Promise<void> {
  loadDotEnvFile('.env.local');
  loadDotEnvFile('.env');

  if (!kitepropApiFeedConfigured()) {
    console.error('Falta KITEPROP_API_KEY o KITEPROP_API_TOKEN en el entorno.');
    process.exit(2);
  }

  const rows = await fetchKitepropPropertyFeedAsRaw({ cache: 'no-store' } as RequestInit);
  if (!rows || rows.length === 0) {
    console.error('La API devolvió 0 filas o el fetch falló.');
    process.exit(1);
  }

  const out = join(process.cwd(), 'packages/core/data/properties.json');
  await writeFile(out, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
  console.log(`OK: ${rows.length} filas → ${out}`);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
