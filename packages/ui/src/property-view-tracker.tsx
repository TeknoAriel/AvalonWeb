'use client';

import { isFeatureEnabled } from '@avalon/config';
import type { NormalizedProperty, SiteType } from '@avalon/types';
import { recordPropertyView } from '@avalon/utils';
import { useEffect, useRef } from 'react';

/** Registra vista reciente + analytics una vez por montaje de ficha. */
export function PropertyViewTracker(props: { site: SiteType; property: NormalizedProperty }) {
  const done = useRef(false);
  useEffect(() => {
    if (!isFeatureEnabled('recents') || done.current) return;
    done.current = true;
    const img = props.property.media.images[0];
    recordPropertyView(props.site, {
      id: props.property.id,
      slug: props.property.slug,
      title: props.property.title,
      thumbUrl: img?.url ?? null,
      subtitle: `${props.property.location.zone} · ${props.property.location.city}`,
    });
  }, [props.site, props.property]);
  return null;
}
