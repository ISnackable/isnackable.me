import { isLocale } from "@repo/internationalization/locales";

const documentTypes = {
  blog: "post",
  projects: "project",
  legal: "legalPage",
} as const;

interface Translation {
  _type?: string;
  language?: string | null;
  noIndex?: boolean;
  slug?: string | null;
}

/** Follow Sanity's translation relationships; equal slugs alone prove nothing. */
export function getTranslationLinks(
  collection: keyof typeof documentTypes,
  current: { locale: string; slug: string },
  translations?: readonly (Translation | null)[] | null
): Record<string, string> {
  const links: Record<string, string> = {};
  const type = documentTypes[collection];
  for (const translation of translations ?? []) {
    if (
      translation?._type === type &&
      isLocale(translation.language) &&
      translation.slug &&
      !translation.noIndex
    ) {
      links[translation.language] =
        `/${translation.language}/${collection}/${encodeURIComponent(translation.slug)}`;
    }
  }
  if (isLocale(current.locale)) {
    links[current.locale] =
      `/${current.locale}/${collection}/${encodeURIComponent(current.slug)}`;
  }
  return links;
}
