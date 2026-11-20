import { sitemap as cmsSitemap } from "@repo/cms";
import { locales } from "@repo/internationalization/locales";
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

// The CMS supplies document URLs, including legal pages. The legal index redirects.
const staticRoutes = ["", "blog", "projects", "resume"];

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const entries = await cmsSitemap.getPaths(locales, staticRoutes);
  return entries.map((entry) => ({
    url: new URL(entry.href, siteUrl).href,
    lastModified: entry._updatedAt ? new Date(entry._updatedAt) : undefined,
  }));
};

export default sitemap;
