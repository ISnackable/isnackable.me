import "server-only";
import { stegaClean } from "@sanity/client/stega";
import { unstable_rethrow } from "next/navigation";
import type { PageRoute } from "../content/pages";
import {
  cachedSanity,
  type FetchOptions,
  getDynamicFetchOptions,
} from "../live";
import { cleanModuleControls } from "../modules/presentation";

import { PAGE_QUERY } from "../queries/pages";
import type { PAGE_QUERY_RESULT } from "../sanity.types";

import { enabled } from "./enabled";

export const pages = {
  get: async (
    route: PageRoute,
    locale: string,
    options?: FetchOptions
  ): Promise<PAGE_QUERY_RESULT> => {
    if (!enabled) {
      return null;
    }
    try {
      const { data } = await cachedSanity({
        ...(await getDynamicFetchOptions(options)),
        query: PAGE_QUERY,
        params: { route, locale },
        tags: ["page"],
      });
      if (data) {
        return {
          ...data,
          route: stegaClean(data.route),
          language: stegaClean(data.language),
          sections:
            data.sections?.map((section) =>
              section._type === "aboutSection"
                ? {
                    ...section,
                    interests:
                      section.interests?.map((interest) => ({
                        ...interest,
                        area: stegaClean(interest.area),
                      })) ?? null,
                  }
                : cleanModuleControls(section)
            ) ?? null,
        };
      }
      return null;
    } catch (error) {
      unstable_rethrow(error);
      return null;
    }
  },
};
