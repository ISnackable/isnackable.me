import { isLocale } from "@repo/internationalization/locales";

interface Translation {
  _type?: string;
  language?: string | null;
  noIndex?: boolean;
  slug?: string | null;
}

/** Follow Sanity's translation relationships; equal slugs alone prove nothing. */
export function getTranslationLinks(
  collection: "blog" | "projects",
  current: { locale: string; slug: string },
  translations?: readonly (Translation | null)[] | null
): Record<string, string> {
  const links: Record<string, string> = {};
  const type = collection === "blog" ? "post" : "project";
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
