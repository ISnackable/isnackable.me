import "server-only";
import { unstable_rethrow } from "next/navigation";
import {
  cachedSanity,
  type FetchOptions,
  getDynamicFetchOptions,
} from "../live";
import { cleanArticleModules } from "../modules/presentation";

import {
  LEGAL_PAGE_QUERY,
  LEGAL_PAGE_SLUGS_QUERY,
  LEGAL_PAGES_META_QUERY,
} from "../queries/legal";
import type {
  LEGAL_PAGE_QUERY_RESULT,
  LEGAL_PAGE_SLUGS_QUERY_RESULT,
  LEGAL_PAGES_META_QUERY_RESULT,
} from "../sanity.types";

import { enabled } from "./enabled";

export const legal = {
  getPostsMeta: async (
    locale: string
  ): Promise<LEGAL_PAGES_META_QUERY_RESULT> => {
    if (!enabled) {
      return [];
    }

    try {
      const { data } = await cachedSanity({
        ...(await getDynamicFetchOptions()),
        query: LEGAL_PAGES_META_QUERY,
        params: { locale },
        tags: ["legalPage"],
      });
      return data ?? [];
    } catch (error) {
      unstable_rethrow(error);
      return [];
    }
  },

  getPost: async (
    slug: string,
    options?: FetchOptions
  ): Promise<LEGAL_PAGE_QUERY_RESULT | null> => {
    if (!enabled) {
      return null;
    }

    try {
      const { data } = await cachedSanity({
        ...(await getDynamicFetchOptions(options)),
        query: LEGAL_PAGE_QUERY,
        params: { slug },
        tags: [`legalPage:${slug}`, "legalPage"],
      });
      return data
        ? { ...data, content: cleanArticleModules(data.content) }
        : null;
    } catch (error) {
      unstable_rethrow(error);
      return null;
    }
  },

  /**
   * Slugs for `generateStaticParams`.
   *
   * Published-only and tagged for Live API / webhook invalidation.
   */
  getSlugs: async (): Promise<LEGAL_PAGE_SLUGS_QUERY_RESULT> => {
    if (!enabled) {
      return [];
    }

    try {
      const { data } = await cachedSanity({
        query: LEGAL_PAGE_SLUGS_QUERY,
        perspective: "published",
        stega: false,
        tags: ["legalPage"],
      });
      return data;
    } catch (error) {
      unstable_rethrow(error);
      return [];
    }
  },
};
