import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import {
  createClient,
  createPreviewSubscriptionHook,
  createCurrentUserHook
} from "next-sanity";
import createImageUrlBuilder from "@sanity/image-url";
import { UseNextSanityImageProps, useNextSanityImage } from "next-sanity-image";
import { sanityConfig } from "./sanity.server";

/**
 * Set up a helper function for generating Image URLs with only the asset reference data in your documents.
 * Read more: https://www.sanity.io/docs/image-url
 **/
export const urlFor = (source: string | object) =>
  createImageUrlBuilder(sanityConfig).image(source);

export const GetNextSanityImage = (
  source: SanityImageSource
): UseNextSanityImageProps => {
  const imageProps = useNextSanityImage(createClient(sanityConfig), source);
  return imageProps;
};
// Set up the live preview subscription hook
export const usePreviewSubscription =
  createPreviewSubscriptionHook(sanityConfig);

// Helper function for using the current logged in user account
export const useCurrentUser = createCurrentUserHook(sanityConfig);
