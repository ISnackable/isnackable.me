import { defineQuery } from "groq";
import { getPublishedId, type ValidationContext } from "sanity";

export const PAGE_IDENTITY_CONFLICT_QUERY = defineQuery(`
  count(*[
    _type == "page" && route == $route && language == $language &&
    !(_id in [$published, $draft]) && !(_id in path("versions.**"))
  ])
`);

/** One public page per route/language, regardless of how its ID was created. */
export async function validatePageIdentity(context: ValidationContext) {
  const { document, getClient } = context;
  if (
    !(
      document?._id &&
      typeof document.route === "string" &&
      typeof document.language === "string"
    )
  ) {
    return true;
  }
  const published = getPublishedId(document._id);
  const count = await getClient({ apiVersion: "2026-06-21" })
    .withConfig({ perspective: "raw", useCdn: false })
    .fetch<number>(PAGE_IDENTITY_CONFLICT_QUERY, {
      published,
      draft: `drafts.${published}`,
      route: document.route,
      language: document.language,
    });
  return (
    count === 0 ||
    "A page already exists for this route and language. Link the existing document through Translations → Manage Translations."
  );
}
