import { MetadataRoute } from 'next';

import { host } from '@/lib/config';
import { getSiteMap } from '@/lib/get-site-map';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteMap = await getSiteMap();
  if (!siteMap?.canonicalPageMap) {
    return [];
  }

  let blogs = Object.keys(siteMap.canonicalPageMap).map(
    (canonicalPagePath) => ({
      url: `${host}/blog/${canonicalPagePath}`,
      priority: 0.7,
      changeFrequency: 'monthly' as const,
    })
  );

  let routes = ['', 'blog'].map((route) => ({
    url: `${host}/${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...routes, ...blogs];
}
