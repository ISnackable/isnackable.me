import Image from "next/image";
import { type CSSProperties, cache } from "react";
import { urlFor } from "../content/images";
import type { SanityImageCrop, SanityImageHotspot } from "../sanity.types";

export interface SanityImageProps {
  className?: string;
  draggable?: boolean;
  fetchPriority?: "auto" | "high" | "low";
  fill?: boolean;
  height?: number;
  image: {
    _type?: "image";
    asset?: {
      _id: string;
      url?: string | null;
      metadata?: {
        lqip?: string | null;
        dimensions?: { width: number | null; height: number | null } | null;
      } | null;
    } | null;
    alt?: string | null;
    crop?: SanityImageCrop | null;
    hotspot?: SanityImageHotspot | null;
  } | null;
  loading?: "eager" | "lazy";
  priority?: boolean;
  quality?: number;
  sizes?: string;
  style?: CSSProperties;
  width?: number;
}

/**
 * Renders a Sanity image via `next/image`.
 *
 * - Uses hotspot/crop data via `urlFor` when dimensions are provided.
 * - Falls back to the original asset URL + metadata dimensions.
 * - Generates a blur placeholder from the Sanity LQIP metadata.
 */
export function SanityImage({
  className,
  draggable,
  fill,
  fetchPriority,
  height,
  image,
  priority,
  quality,
  loading,
  sizes = "100vw",
  style,
  width,
}: SanityImageProps) {
  const asset = image?.asset;
  if (!(asset?._id || asset?.url)) {
    return null;
  }

  const dimensions = asset?.metadata?.dimensions;
  const w = width ?? dimensions?.width ?? 1200;
  const h = height ?? dimensions?.height ?? 630;

  const src =
    width || height
      ? // biome-ignore lint/style/noNonNullAssertion: asset existence verified above
        urlFor(image!).width(w).height(h).fit("crop").auto("format").url()
      : asset.url;

  return (
    <Image
      alt={image?.alt ?? ""}
      blurDataURL={asset?.metadata?.lqip ?? undefined}
      className={className}
      draggable={draggable}
      fetchPriority={fetchPriority}
      fill={fill}
      height={fill ? undefined : h}
      loading={loading}
      placeholder={asset?.metadata?.lqip ? "blur" : undefined}
      priority={priority}
      quality={quality}
      sizes={sizes}
      // biome-ignore lint/style/noNonNullAssertion: asset existence verified above
      src={src ?? asset.url!}
      style={style}
      width={fill ? undefined : w}
    />
  );
}

/**
 * Build a Sanity image URL. Memoized via `cache` since the same image is
 * often rendered multiple times per request (e.g. in cards + Open Graph).
 */
export const getImageUrl = cache(
  (image: SanityImageProps["image"], width?: number, height?: number) => {
    if (!image?.asset?.url) {
      return null;
    }
    if (width && height) {
      return urlFor(image).width(width).height(height).fit("crop").url();
    }
    return image.asset.url;
  }
);
