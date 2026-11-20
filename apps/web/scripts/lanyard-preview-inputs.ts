import { createHash } from "node:crypto";
import { urlFor } from "@repo/cms/content/images";
import type { HeroSectionContent } from "@repo/cms/content/pages";
import { httpsUrl } from "@repo/cms/content/site";
import { PAGE_QUERY } from "@repo/cms/queries/pages";
import { locales } from "@repo/internationalization/locales";
import { createClient } from "@sanity/client";
import { lanyardDictionary } from "../app/(main)/[locale]/(home)/components/lanyard-profile";
import { lanyardPreviewKey } from "../lib/lanyard-preview-key";

export { locales } from "@repo/internationalization/locales";

export {
  LANYARD_HERO_FOV,
  LANYARD_PREVIEW_SIZES,
  LANYARD_PREVIEW_VERSION,
} from "../app/(main)/[locale]/(home)/components/lanyard-preview";

export async function previewInputs(
  messages: Record<string, { placeholderName: string; flipBack: string }>
) {
  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "",
    apiVersion: "2026-06-21",
    token: process.env.SANITY_API_READ_TOKEN || undefined,
    perspective: "published",
    useCdn: false,
    stega: false,
  });
  const signal = AbortSignal.timeout(30_000);
  const revision = client.fetch<{ _id: string; _rev: string }[]>(
    '*[!(_id in path("drafts.**")) && !(_id in path("versions.**"))]{_id, _rev} | order(_id asc)',
    {},
    { signal }
  );
  const resultsPromise = Promise.all(
    locales.map(async (locale) => {
      const page = await client.fetch<{
        sections?: HeroSectionContent[];
      } | null>(PAGE_QUERY, { route: "home", locale }, { signal });
      const badge = page?.sections?.find(
        (section) => section._type === "heroSection"
      )?.badge;
      if (!badge) {
        return null;
      }
      const dictionary = lanyardDictionary(
        badge,
        messages[locale].placeholderName,
        messages[locale].flipBack
      );
      const portrait = badge.portrait?.asset?.url
        ? httpsUrl(
            urlFor(badge.portrait).width(512).height(512).fit("crop").url()
          )
        : "";
      return {
        key: lanyardPreviewKey(dictionary, portrait),
        locale,
        portrait,
        dictionary,
      };
    })
  );
  const [results, revisions] = await Promise.all([resultsPromise, revision]);
  return {
    publishedRevision: createHash("sha256")
      .update(JSON.stringify(revisions))
      .digest("hex"),
    inputs: results.filter((result) => result !== null),
  };
}
