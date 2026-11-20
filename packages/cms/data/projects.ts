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
  PROJECT_QUERY,
  PROJECT_SLUGS_QUERY,
  PROJECTS_META_QUERY,
} from "../queries/projects";
import type {
  PROJECT_QUERY_RESULT,
  PROJECT_SLUGS_QUERY_RESULT,
  PROJECTS_META_QUERY_RESULT,
} from "../sanity.types";

import { enabled } from "./enabled";

export const projects = {
  /** Latest projects for a locale, sorted featured-first then by date. */
  getMeta: async (
    locale: string,
    limit: number
  ): Promise<PROJECTS_META_QUERY_RESULT> => {
    if (!enabled) {
      return [];
    }

    try {
      const { data } = await cachedSanity({
        ...(await getDynamicFetchOptions()),
        query: PROJECTS_META_QUERY,
        params: { locale, limit },
        tags: ["project"],
      });
      return data ?? [];
    } catch (error) {
      unstable_rethrow(error);
      return [];
    }
  },

  getPost: async (
    slug: string,
    locale: string,
    options?: FetchOptions
  ): Promise<PROJECT_QUERY_RESULT | null> => {
    if (!enabled) {
      return null;
    }

    try {
      const { data } = await cachedSanity({
        ...(await getDynamicFetchOptions(options)),
        query: PROJECT_QUERY,
        params: { slug, locale },
        tags: [`project:${slug}`, "project", "translation.metadata"],
      });
      return data
        ? {
            ...data,
            status: stegaClean(data.status),
            content: cleanArticleModules(data.content),
            translations: stegaClean(data.translations),
          }
        : null;
    } catch (error) {
      unstable_rethrow(error);
      return null;
    }
  },

  /**
   * Published project slugs and languages for translated metadata alternates.
   * Tagged for Live API / webhook invalidation.
   */
  getSlugs: async (): Promise<PROJECT_SLUGS_QUERY_RESULT> => {
    if (!enabled) {
      return [];
    }

    try {
      const { data } = await cachedSanity({
        query: PROJECT_SLUGS_QUERY,
        perspective: "published",
        stega: false,
        tags: ["project"],
      });
      return data;
    } catch (error) {
      unstable_rethrow(error);
      return [];
    }
  },
};
