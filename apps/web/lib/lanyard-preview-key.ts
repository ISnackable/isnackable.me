import { createHash } from "node:crypto";
import type { LanyardDictionary } from "../app/(main)/[locale]/(home)/components/lanyard-content";
import {
  LANYARD_HERO_FOV,
  LANYARD_PREVIEW_VERSION,
} from "../app/(main)/[locale]/(home)/components/lanyard-preview";

/** Only visible front inputs invalidate a first-frame snapshot. */
export function lanyardPreviewKey(
  dictionary: LanyardDictionary,
  portrait: string
) {
  const profile = dictionary.badgeProfile;
  return createHash("sha256")
    .update(
      JSON.stringify([
        LANYARD_PREVIEW_VERSION,
        LANYARD_HERO_FOV,
        portrait,
        profile.name,
        profile.status,
        profile.pass,
        profile.handle,
        profile.summary,
        profile.details,
      ])
    )
    .digest("hex");
}
