import type { SlugValidationContext } from "@sanity/types";

import { defaultLocaleId } from "../../studio/localization";

const DRAFTS_PREFIX = /^drafts\./;

/**
 * Per-language slug uniqueness check.
 *
 * Excludes BOTH the draft and published ids of the document being
 * edited so an in-progress draft never self-collides — the classic
 * "slug always taken" bug that occurs when only the published id is
 * excluded (the draft `drafts.<id>` then matches itself).
 *
 * Uses the Studio's context `getClient` (not the app's CDN client) to
 * avoid stale reads during validation. Scoped by `language` so the
 * same slug may exist in different locales.
 */
export async function isUniqueSlug(
  slug: string,
  context: SlugValidationContext
): Promise<boolean> {
  const { document, getClient } = context;
  const id = document?._id?.replace(DRAFTS_PREFIX, "");

  // Brand-new, never-saved document — nothing to collide with yet.
  if (!id) {
    return true;
  }

  const language = (document?.language as string) ?? defaultLocaleId;

  const count = await getClient({ apiVersion: "2026-06-21" }).fetch<number>(
    `count(*[
      _type == $type &&
      !(_id in [$draft, $published]) &&
      (language == $language || ($type == "legalPage" && $language == $defaultLocale && !defined(language))) &&
      slug.current == $slug
    ])`,
    {
      type: document?._type,
      draft: `drafts.${id}`,
      published: id,
      language,
      defaultLocale: defaultLocaleId,
      slug,
    }
  );

  return count === 0;
}
