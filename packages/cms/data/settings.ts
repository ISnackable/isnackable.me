import "server-only";
import { unstable_rethrow } from "next/navigation";
import {
  cachedSanity,
  type FetchOptions,
  getDynamicFetchOptions,
} from "../live";

import { SETTINGS_QUERY } from "../queries/settings";
import type { SETTINGS_QUERY_RESULT } from "../sanity.types";

import { enabled } from "./enabled";

export const settings = {
  get: async (options?: FetchOptions): Promise<SETTINGS_QUERY_RESULT> => {
    if (!enabled) {
      return null;
    }
    try {
      const { data } = await cachedSanity({
        ...(await getDynamicFetchOptions(options)),
        query: SETTINGS_QUERY,
        params: {},
        tags: ["settings"],
      });
      return data;
    } catch (error) {
      unstable_rethrow(error);
      return null;
    }
  },
};
