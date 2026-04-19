/**
 * Informe de ingesta KiteProp orientado a Premier: cuántas filas, cuántas con segmento Premier,
 * cuántas listables en el sitio, y motivo de descarte por fila.
 *
 *   export KITEPROP_API_KEY='kp_…'
 *   pnpm kp:premier-feed-report
 *
 * Salida JSON resumida a stdout. Detalle completo por id:
 *   PREMIER_FEED_REPORT_FULL=1 pnpm kp:premier-feed-report
 * Archivo (además de stdout resumen):
 *   PREMIER_FEED_REPORT_JSON=/ruta/reporte.json pnpm kp:premier-feed-report
 */
import { writeFile } from 'node:fs/promises';

import {
  diagnosePremierFeedRow,
  fetchKitepropPropertyFeedAsRaw,
  kitepropApiFeedConfigured,
} from '@avalon/core';

async function main(): Promise<void> {
  if (!kitepropApiFeedConfigured()) {
    console.error('Falta KITEPROP_API_KEY o KITEPROP_API_TOKEN en el entorno.');
    process.exit(2);
  }

  const raw = await fetchKitepropPropertyFeedAsRaw({ cache: 'no-store' } as RequestInit);
  if (!raw || raw.length === 0) {
    console.error('La API devolvió 0 filas o el fetch falló.');
    process.exit(1);
  }

  const rows = raw.map((r) => diagnosePremierFeedRow(r));

  const byDiscard: Record<string, number> = {};
  const bySegmentSource: Record<string, number> = {};
  const byStatusNormTagged: Record<string, number> = {};

  let listable = 0;
  let tagged = 0;
  for (const d of rows) {
    if (d.hasPremierTag) tagged += 1;
    if (d.isPremierSiteListable) listable += 1;
    byDiscard[d.discardFromPremierSite] = (byDiscard[d.discardFromPremierSite] ?? 0) + 1;
    bySegmentSource[d.segmentPrimarySource] = (bySegmentSource[d.segmentPrimarySource] ?? 0) + 1;
    if (d.hasPremierTag) {
      byStatusNormTagged[d.statusNorm || '(vacío)'] = (byStatusNormTagged[d.statusNorm || '(vacío)'] ?? 0) + 1;
    }
  }

  const discarded = rows.filter((d) => !d.isPremierSiteListable);
  const discardedTerminal = discarded.filter((d) => d.discardFromPremierSite === 'status_terminal_premier');
  const discardedNoSegment = discarded.filter((d) => d.discardFromPremierSite === 'sin_segmento_premier');

  const summary = {
    generatedAt: new Date().toISOString(),
    totalRows: raw.length,
    hasPremierTagCount: tagged,
    isPremierSiteListableCount: listable,
    discardedFromPremierSiteCount: discarded.length,
    discardedBreakdown: {
      sin_segmento_premier: discardedNoSegment.length,
      status_terminal_premier: discardedTerminal.length,
      /** Incluye listables (ninguno) para cuadre con totalRows */
      listados_en_sitio_premier: listable,
    },
    countsByDiscardReason: byDiscard,
    countsBySegmentPrimarySource: bySegmentSource,
    /** Solo filas con hasPremierTag: histograma de status normalizado */
    statusHistogramAmongPremierTagged: Object.fromEntries(
      Object.entries(byStatusNormTagged).sort((a, b) => b[1] - a[1]),
    ),
  };

  console.log(JSON.stringify(summary, null, 2));

  const full = process.env.PREMIER_FEED_REPORT_FULL === '1' || process.env.PREMIER_FEED_REPORT_FULL === 'true';
  if (full) {
    console.log('\n--- DETALLE POR REGISTRO (JSON array) ---\n');
    console.log(JSON.stringify(rows, null, 2));
  } else {
    console.log('\n--- DESCARTADAS DEL SITIO PREMIER (id, motivo, detalle) ---\n');
    for (const d of discarded) {
      console.log(
        JSON.stringify({
          id: d.id,
          status: d.statusRaw,
          statusNorm: d.statusNorm,
          segmentPrimarySource: d.segmentPrimarySource,
          hasPremierTag: d.hasPremierTag,
          discard: d.discardFromPremierSite,
          detalle: d.discardDetailEs,
        }),
      );
    }
    console.log(`\n(Total descartadas: ${discarded.length}. Para el array completo de todas las filas: PREMIER_FEED_REPORT_FULL=1)`);
  }

  const out = process.env.PREMIER_FEED_REPORT_JSON?.trim();
  if (out) {
    const payload = full ? { summary, rows } : { summary, discardedRows: discarded, allRows: rows };
    await writeFile(out, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    console.error(`\nEscrito: ${out}`);
  }
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
