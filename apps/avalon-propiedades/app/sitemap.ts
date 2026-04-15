import { getSiteBrandConfig } from '@avalon/config';
import { getSitePropertiesFromRaw } from '@avalon/core';
import type { MetadataRoute } from 'next';
import { getCachedRawProperties } from '@/lib/raw-properties';
import { SITE } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const brand = getSiteBrandConfig(SITE);
  const base = brand.urls.base.replace(/\/$/, '');
  const raw = await getCachedRawProperties();
  const properties = getSitePropertiesFromRaw(SITE, raw);

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/propiedades',
    '/propiedades/comparar',
    '/contacto',
    '/institucional',
  ].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: path === '' ? 1 : 0.7,
    })
  );

  const propertyRoutes: MetadataRoute.Sitemap = properties.map((p) => ({
    url: `${base}/propiedades/${p.slug}`,
    lastModified: new Date(p.lastUpdate),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...propertyRoutes];
}
