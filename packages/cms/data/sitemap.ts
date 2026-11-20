import "server-only";
import { unstable_rethrow } from "next/navigation";
import { cachedSanity } from "../live";

import { SITEMAP_QUERY } from "../queries/sitemap";
import type { SitemapEntry } from "../types";
import { enabled } from "./enabled";

export const sitemap = {
  /**
   * Combines filesystem routes with CMS content and page visibility.
   * Unconfigured or unavailable datasets retain only the supplied static routes.
   */
  getPaths: async (
    locales: readonly string[],
    staticRoutes: readonly string[]
  ): Promise<SitemapEntry[]> => {
    const staticPaths = locales.flatMap((locale) =>
      staticRoutes.map((route) => ({
        href: `/${locale}${route ? `/${route}` : ""}`,
      }))
    );
    if (!enabled) {
      return staticPaths;
    }

    try {
      const { data } = await cachedSanity({
        query: SITEMAP_QUERY,
        perspective: "published",
        stega: false,
        tags: ["page", "post", "project", "legalPage"],
      });

      const result = data;

      if (!result) {
        return staticPaths;
      }

      const pagePaths: SitemapEntry[] = staticPaths.flatMap((entry) => {
        // The query orders duplicates like PAGE_QUERY, so the first match is
        // the same canonical document used by the page's metadata.
        const page = result.pages.find(
          ({ route, language }) =>
            route &&
            language &&
            entry.href === `/${language}${route === "home" ? "" : `/${route}`}`
        );
        return page?.noIndex
          ? []
          : [{ ...entry, _updatedAt: page?._updatedAt }];
      });

      const postPaths: SitemapEntry[] = result.posts
        .filter((post) => post.language && locales.includes(post.language))
        .filter((post): post is typeof post & { slug: string } =>
          Boolean(post.slug)
        )
        .map((post) => ({
          href: `/${post.language}/blog/${post.slug}`,
          _updatedAt: post._updatedAt,
        }));

      const projectPaths: SitemapEntry[] = result.projects
        .filter(
          (project) => project.language && locales.includes(project.language)
        )
        .filter((project): project is typeof project & { slug: string } =>
          Boolean(project.slug)
        )
        .map((project) => ({
          href: `/${project.language}/projects/${project.slug}`,
          _updatedAt: project._updatedAt,
        }));

      const legalPaths: SitemapEntry[] = result.legalPages
        .filter((page): page is typeof page & { slug: string } =>
          Boolean(page.slug)
        )
        .flatMap((page) =>
          locales.map((locale) => ({
            href: `/${locale}/legal/${page.slug}`,
            _updatedAt: page._updatedAt,
          }))
        );

      return [...pagePaths, ...postPaths, ...projectPaths, ...legalPaths];
    } catch (error) {
      unstable_rethrow(error);
      return staticPaths;
    }
  },
};
