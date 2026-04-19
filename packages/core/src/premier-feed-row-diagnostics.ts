import type { RawProperty } from '@avalon/types';
import { hasPremierTag, premierSegmentPrimarySource, type PremierSegmentPrimarySource } from './premier';
import { isPremierSiteListable, propertyStatusKey } from './listing-rules';

export type PremierSiteDiscardReason = 'ninguno' | 'sin_segmento_premier' | 'status_terminal_premier';

export type PremierFeedRowDiagnosis = {
  id: number;
  statusRaw: string;
  statusNorm: string;
  /** Primera fuente por prioridad (aunque `hasPremierTag` sea false puede ser `crm_explicit_false` o `sin_señal`). */
  segmentPrimarySource: PremierSegmentPrimarySource;
  hasPremierTag: boolean;
  isPremierSiteListable: boolean;
  discardFromPremierSite: PremierSiteDiscardReason;
  /** Texto legible para humanos (español). */
  discardDetailEs: string | null;
};

/**
 * Diagnóstico alineado con `hasPremierTag` + `isPremierSiteListable` (listado sitio Premier).
 */
export function diagnosePremierFeedRow(raw: RawProperty): PremierFeedRowDiagnosis {
  const tag = hasPremierTag(raw);
  const list = isPremierSiteListable(raw);
  const src = premierSegmentPrimarySource(raw);
  const stNorm = propertyStatusKey(raw);
  const statusRaw = String(raw.status ?? '');

  let discard: PremierSiteDiscardReason = 'ninguno';
  let detail: string | null = null;

  if (list) {
    discard = 'ninguno';
    detail = null;
  } else if (!tag) {
    discard = 'sin_segmento_premier';
    if (src === 'crm_explicit_false') {
      detail =
        'Hay flags CRM `premier` / `is_premier` (o alias) en **false** explícito y no hay tag/lista/override que anule.';
    } else {
      detail =
        'Sin señal Premier: revisá tags, modificadores, `PREMIER_PROPERTY_IDS`, `KITEPROP_PREMIER_SAVED_LIST_IDS` o flags en JSON.';
    }
  } else {
    discard = 'status_terminal_premier';
    detail = `Segmento Premier sí, pero el estado "${statusRaw}" (${stNorm}) se trata como **cierre definitivo** en el sitio (sold/archived/…).`;
  }

  return {
    id: raw.id,
    statusRaw,
    statusNorm: stNorm,
    segmentPrimarySource: src,
    hasPremierTag: tag,
    isPremierSiteListable: list,
    discardFromPremierSite: discard,
    discardDetailEs: detail,
  };
}
