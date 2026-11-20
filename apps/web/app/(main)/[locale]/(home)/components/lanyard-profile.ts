import type { HeroSectionContent } from "@repo/cms/content/pages";
import { contentText } from "@repo/cms/content/text";
import { stegaClean } from "@sanity/client/stega";
import type { LanyardDictionary } from "./lanyard-content";

/** Keep snapshot inputs identical to the badge shown by the hero. */
export function lanyardDictionary(
  badge: NonNullable<HeroSectionContent["badge"]>,
  placeholderName: string,
  flipBack: string
): LanyardDictionary {
  return {
    badgeProfile: stegaClean({
      name: contentText(badge.displayName) || placeholderName,
      status: badge.status ?? "",
      pass: badge.pass ?? "",
      handle: badge.handle ?? "",
      summary: badge.summary ?? "",
      details: badge.details ?? [],
    }),
    cardBackProfile: stegaClean({
      title: badge.backTitle ?? "",
      subtitle: badge.backSubtitle ?? "",
      description: badge.backDescription ?? "",
      footer: flipBack,
    }),
  };
}
