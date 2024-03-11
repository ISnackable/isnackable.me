import { MetadataRoute } from 'next';

import { host } from '@/lib/config';
import { getSiteMap } from '@/lib/get-site-map';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ['', 'blog', 'projects'].map((route) => ({
    url: `${host}/${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const siteMap = await getSiteMap();
  if (!siteMap?.slug) {
    return routes;
  }

  const notionPages = Object.keys(siteMap.slug).map((canonicalPagePath) => ({
    url: `${host}/${canonicalPagePath}`,
    priority: 0.7,
    changeFrequency: 'monthly' as const,
  }));

  return [...routes, ...notionPages];
}
