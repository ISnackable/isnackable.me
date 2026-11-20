import { createImageUrlBuilder } from "@sanity/image-url";
import { keys } from "../keys";

let builder: ReturnType<typeof createImageUrlBuilder> | undefined;

/**
 * Build optimized Sanity image URLs (resize, crop, format).
 *
 * Usage:
 * ```ts
 * urlFor(image).width(800).height(600).fit("crop").url()
 * ```
 *
 * The URL builder automatically uses hotspot/crop data when available.
 */
export const urlFor = (
  source: Parameters<ReturnType<typeof createImageUrlBuilder>["image"]>[0]
) => {
  if (!builder) {
    const { NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET } =
      keys();
    builder = createImageUrlBuilder({
      projectId: NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: NEXT_PUBLIC_SANITY_DATASET,
    });
  }
  return builder.image(source);
};
