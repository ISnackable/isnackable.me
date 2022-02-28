// INSPIRED FROM https://github.com/bundlesandbatches/next-sanity-image
// https://gist.github.com/kmelve/e047d40e24d92f1b4751535a4cee1e59
import type { NextPage } from "next";
import type { ImageProps } from "next/image";
import type {
  SanityImageDimensions,
  SanityImageObject
} from "@sanity/image-url/lib/types/types";
import type { SanityImageSource } from "@sanity/asset-utils/dist/types";
import type { ImageUrlBuilder } from "@sanity/image-url/lib/types/builder";
import React from "react";
import Image, { ImageLoader } from "next/image";
import { urlFor } from "@lib/sanity";
import { isReference, getImageDimensions } from "@sanity/asset-utils";

interface Props {
  image: SanityImageObject;
  options: SanityNextImageOptions;
}

interface SanityNextImageOptions extends Omit<ImageProps, "src"> {
  src?: string;
  lqip?: string;
}

interface SanityNextImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

interface SanityNextImageBuilderOptions {
  width: number | null;
  originalImageDimensions: SanityImageDimensions;
  croppedImageDimensions: SanityImageDimensions;
  quality: number | null;
}

type SanityNextImageBuilderBase<Options> = (
  imageUrlBuilder: ImageUrlBuilder,
  options: Options
) => ImageUrlBuilder;

type SanityNextImageBuilder =
  SanityNextImageBuilderBase<SanityNextImageBuilderOptions>;

const DEFAULT_FALLBACK_IMAGE_QUALITY = 75;

const imageBuilder: SanityNextImageBuilder = (imageUrlBuilder, options) => {
  const result = imageUrlBuilder
    .quality(options.quality || DEFAULT_FALLBACK_IMAGE_QUALITY)
    .fit("clip");

  if (options.width !== null) {
    return result.width(options.width);
  }

  return result;
};

const getCroppedDimensions = (
  image: SanityImageSource,
  baseDimensions: SanityNextImageDimensions
): SanityNextImageDimensions => {
  const crop = (image as SanityImageObject).crop;

  if (!crop) {
    return baseDimensions;
  }

  const { width, height } = baseDimensions;
  const croppedWidth = width * (1 - (crop.left + crop.right));
  const croppedHeight = height * (1 - (crop.top + crop.bottom));

  return {
    width: croppedWidth,
    height: croppedHeight,
    aspectRatio: croppedWidth / croppedHeight
  };
};

const SanityNextImage: NextPage<Props> = React.memo((props) => {
  const { image, options } = props;
  if (!image) {
    return null;
  }

  if (!isReference(image?.asset)) {
    return null;
  }

  const originalImageDimensions = getImageDimensions(
    image as SanityImageSource
  );
  const croppedImageDimensions = getCroppedDimensions(
    image as SanityImageSource,
    originalImageDimensions
  );

  const loader: ImageLoader = ({ width, quality }) => {
    return (
      imageBuilder(urlFor(image).auto("format"), {
        width,
        originalImageDimensions,
        croppedImageDimensions,
        quality: quality || null
      }).url() || ""
    );
  };

  const baseImgBuilderInstance = imageBuilder(urlFor(image).auto("format"), {
    width: null,
    originalImageDimensions,
    croppedImageDimensions,
    quality: null
  });

  const width =
    (options?.width as number) ||
    baseImgBuilderInstance.options.width ||
    (baseImgBuilderInstance.options.maxWidth
      ? Math.min(
          baseImgBuilderInstance.options.maxWidth,
          croppedImageDimensions.width
        )
      : croppedImageDimensions.width);

  const height =
    options?.height ||
    baseImgBuilderInstance.options.height ||
    (baseImgBuilderInstance.options.maxHeight
      ? Math.min(
          baseImgBuilderInstance.options.maxHeight,
          croppedImageDimensions.height
        )
      : Math.round(width / croppedImageDimensions.aspectRatio));

  return (
    <div className="sanity-image">
      <Image
        loader={loader}
        src={options?.src ?? baseImgBuilderInstance.url()}
        alt={options?.alt}
        width={width}
        height={height}
        {...options}
      />
    </div>
  );
});

export default SanityNextImage;
