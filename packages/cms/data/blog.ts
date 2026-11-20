import "server-only";
import { stegaClean } from "@sanity/client/stega";
import { unstable_rethrow } from "next/navigation";
import {
  cachedSanity,
  type FetchOptions,
  getDynamicFetchOptions,
} from "../live";
import { cleanArticleModules } from "../modules/presentation";

import {
  BLOG_INDEX_QUERY,
  blogSearchTerms,
  LATEST_POSTS_QUERY,
  POST_QUERY,
  POST_SLUGS_QUERY,
} from "../queries/blog";
import type {
  BLOG_INDEX_QUERY_RESULT,
  LATEST_POSTS_QUERY_RESULT,
  POST_QUERY_RESULT,
  POST_SLUGS_QUERY_RESULT,
} from "../sanity.types";

import { enabled } from "./enabled";

export const postsPerPage = 6;

export interface BlogFilters {
  page: number;
  q: string;
  tag: string;
}

export const blog = {
  getIndex: async (
    locale: string,
    filters: BlogFilters
  ): Promise<BLOG_INDEX_QUERY_RESULT> => {
    const empty = { posts: [], tags: [], total: 0 };
    if (!enabled) {
      return empty;
    }
    try {
      const start = (filters.page - 1) * postsPerPage;
      const { data } = await cachedSanity({
        ...(await getDynamicFetchOptions()),
        query: BLOG_INDEX_QUERY,
        params: {
          locale,
          topic: filters.tag,
          search: blogSearchTerms(filters.q),
          start,
          end: start + postsPerPage,
        },
        tags: ["post", "author"],
      });
      return data ? { ...data, tags: stegaClean(data.tags) } : empty;
    } catch (error) {
      unstable_rethrow(error);
      return empty;
    }
  },
  getPost: async (
    slug: string,
    locale: string,
    options?: FetchOptions
  ): Promise<POST_QUERY_RESULT | null> => {
    if (!enabled) {
      return null;
    }

    try {
      const { data } = await cachedSanity({
        ...(await getDynamicFetchOptions(options)),
        query: POST_QUERY,
        params: { slug, locale },
        // Slug-specific tag for surgical invalidation, plus the
        // referenced-content tags so author edits refresh
        // this post too.
        tags: [`post:${slug}`, "post", "author", "translation.metadata"],
      });
      return data
        ? {
            ...data,
            content: cleanArticleModules(data.content),
            translations: stegaClean(data.translations),
          }
        : null;
    } catch (error) {
      unstable_rethrow(error);
      return null;
    }
  },

  /** Most recent posts for the homepage blog section. */
  getLatestPosts: async (
    locale: string,
    limit: number
  ): Promise<LATEST_POSTS_QUERY_RESULT> => {
    if (!enabled) {
      return [];
    }

    try {
      const { data } = await cachedSanity({
        ...(await getDynamicFetchOptions()),
        query: LATEST_POSTS_QUERY,
        params: { locale, limit },
        tags: ["post", "author"],
      });
      return data ?? [];
    } catch (error) {
      unstable_rethrow(error);
      return [];
    }
  },

  /**
   * Published post slugs and languages for translated metadata alternates.
   *
   * Published-only, tagged cache shared with metadata and sitemap reads.
   * The Live API and signed webhook invalidate it when content changes.
   */
  getSlugs: async (): Promise<POST_SLUGS_QUERY_RESULT> => {
    if (!enabled) {
      return [];
    }

    try {
      const { data } = await cachedSanity({
        query: POST_SLUGS_QUERY,
        perspective: "published",
        stega: false,
        tags: ["post"],
      });
      return data;
    } catch (error) {
      unstable_rethrow(error);
      return [];
    }
  },
};
