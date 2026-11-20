import { stegaClean } from "@sanity/client/stega";
import type { AboutSectionContent } from "./pages";
import { contentText } from "./text";

export type InterestStyle = "software" | "systems" | "security";
type StoredInterest = NonNullable<AboutSectionContent["interests"]>[number];

export interface AboutInterest {
  _key: string;
  description: string;
  image: StoredInterest["image"];
  style: InterestStyle;
  title: string;
}

export interface AboutContent {
  biography: string;
  headline: string;
  interests: AboutInterest[];
}

/** Preserve editorial order and valid draft fields without inventing content. */
export function resolveAbout(
  section: AboutSectionContent | null
): AboutContent {
  const seen = new Set<string>();
  const interests: AboutInterest[] = [];
  for (const item of section?.interests ?? []) {
    // The stored `area` field stays compatible with imported pages; it selects
    // presentation independently of the topic's identity.
    const style = stegaClean(item.area);
    if (
      !(
        (style === "software" || style === "systems" || style === "security") &&
        item._key
      ) ||
      seen.has(item._key) ||
      !contentText(item.title)
    ) {
      continue;
    }
    seen.add(item._key);
    interests.push({
      _key: item._key,
      style,
      title: contentText(item.title),
      description: contentText(item.description),
      image: item.image?.asset ? item.image : null,
    });
  }
  return {
    headline: contentText(section?.headline),
    biography: contentText(section?.biography),
    interests,
  };
}
