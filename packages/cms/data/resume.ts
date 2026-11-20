import "server-only";
import { stegaClean } from "@sanity/client/stega";
import { unstable_rethrow } from "next/navigation";
import type { ResumeData } from "../content/resume";
import {
  cachedSanity,
  type FetchOptions,
  getDynamicFetchOptions,
} from "../live";
import { RESUME_LANGUAGES_QUERY, RESUME_QUERY } from "../queries/resume";
import type { RESUME_LANGUAGES_QUERY_RESULT } from "../sanity.types";

import { enabled } from "./enabled";

export const resume = {
  getLanguages: async (
    options?: FetchOptions
  ): Promise<RESUME_LANGUAGES_QUERY_RESULT> => {
    if (!enabled) {
      return [];
    }
    try {
      const { data } = await cachedSanity({
        ...(await getDynamicFetchOptions(options)),
        query: RESUME_LANGUAGES_QUERY,
        tags: ["resume"],
      });
      return stegaClean(data ?? []);
    } catch (error) {
      unstable_rethrow(error);
      return [];
    }
  },
  /**
   * Fetches the resume document for a given locale.
   * Pass `stega: false` for `generateMetadata` so overlay chars never leak
   * into `<head>` tags.
   */
  get: async (
    locale: string,
    options?: FetchOptions
  ): Promise<ResumeData | null> => {
    if (!enabled) {
      return null;
    }

    try {
      const { data } = await cachedSanity({
        ...(await getDynamicFetchOptions(options)),
        query: RESUME_QUERY,
        params: { locale },
        tags: [`resume:${locale}`, "resume"],
      });
      return data;
    } catch (error) {
      unstable_rethrow(error);
      return null;
    }
  },
};
