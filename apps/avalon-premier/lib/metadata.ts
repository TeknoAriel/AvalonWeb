import type { Metadata } from 'next';
import { getSiteBrandConfig } from '@avalon/config';
import { brandAssets } from '@avalon/branding';
import { SITE } from './site';

export function rootMetadata(): Metadata {
  const brand = getSiteBrandConfig(SITE);
  const base = brand.urls.base.replace(/\/$/, '');
  const og = brandAssets[SITE].og;
  return {
    metadataBase: new URL(base),
    title: {
      default: `${brand.name} — ${brand.tagline}`,
      template: `%s · ${brand.name}`,
    },
    description: brand.description,
    openGraph: {
      type: 'website',
      locale: 'es_AR',
      siteName: brand.name,
      title: brand.name,
      description: brand.description,
      images: [{ url: og }],
    },
    icons: {
      icon: '/favicon.png',
    },
    robots: { index: true, follow: true },
  };
}
