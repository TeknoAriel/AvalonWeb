import { getSiteBrandConfig } from '@avalon/config';
import { getSiteProperties } from '@avalon/core';
import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const brand = getSiteBrandConfig(SITE);
  const base = brand.urls.base.replace(/\/$/, '');
  const properties = getSiteProperties(SITE);

  const staticRoutes: MetadataRoute.Sitemap = ['', '/propiedades', '/contacto', '/institucional'].map(
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
