import "server-only";
import { defaultLocale, type Locale } from "@repo/internationalization/locales";
import { stegaClean } from "@sanity/client/stega";
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

async function getLocalizedPost(
  slug: string,
  locale: Locale,
  options?: FetchOptions
): Promise<LEGAL_PAGE_QUERY_RESULT | null> {
  if (!enabled) {
    return null;
  }

  try {
    const { data } = await cachedSanity({
      ...(await getDynamicFetchOptions(options)),
      query: LEGAL_PAGE_QUERY,
      params: { slug, locale, defaultLocale },
      tags: [`legalPage:${slug}`, "legalPage", "translation.metadata"],
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
}

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
        params: { locale, defaultLocale },
        tags: ["legalPage"],
      });
      return data ?? [];
    } catch (error) {
      unstable_rethrow(error);
      return [];
    }
  },

  getPost: async (slug: string, locale: Locale, options?: FetchOptions) => {
    const localized = await getLocalizedPost(slug, locale, options);
    if (localized) {
      return { document: localized, locale, slug };
    }
    if (locale === defaultLocale) {
      return null;
    }

    // Older policy links used the English slug in every language.
    const source = await getLocalizedPost(slug, defaultLocale, options);
    if (!source) {
      return null;
    }
    const alternate = source.translations.find(
      (entry) => entry?._type === "legalPage" && entry.language === locale
    );
    if (alternate?.slug) {
      const translated = await getLocalizedPost(
        alternate.slug,
        locale,
        options
      );
      if (translated) {
        return { document: translated, locale, slug: alternate.slug };
      }
    }

    return { document: source, locale: defaultLocale, slug };
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
      return data ?? [];
    } catch (error) {
      unstable_rethrow(error);
      return [];
    }
  },
};
