/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
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

interface Props extends Omit<ImageProps, "src"> {
  image: SanityImageObject;
  src?: string;
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

interface SanityNextBlurUpImageBuilderOptions
  extends SanityNextImageBuilderOptions {
  blurAmount: number | null;
}

type SanityNextImageBuilderBase<Options> = (
  imageUrlBuilder: ImageUrlBuilder,
  options: Options
) => ImageUrlBuilder;

type SanityNextImageBuilder =
  SanityNextImageBuilderBase<SanityNextImageBuilderOptions>;

type SanityNextBlurUpImageBuilder =
  SanityNextImageBuilderBase<SanityNextBlurUpImageBuilderOptions>;

const DEFAULT_BLUR_UP_IMAGE_WIDTH = 64;
const DEFAULT_BLUR_UP_IMAGE_QUALITY = 30;
const DEFAULT_BLUR_UP_AMOUNT = 50;

const DEFAULT_FALLBACK_IMAGE_QUALITY = 75;

const blurUpImageBuilder: SanityNextBlurUpImageBuilder = (
  imageUrlBuilder,
  options
) => {
  return imageUrlBuilder
    .width(options.width || DEFAULT_BLUR_UP_IMAGE_WIDTH)
    .quality(options.quality || DEFAULT_BLUR_UP_IMAGE_QUALITY)
    .blur(options.blurAmount || DEFAULT_BLUR_UP_AMOUNT)
    .fit("clip");
};

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
  let blurImgBuilderInstance;
  const { image, ...imageProps } = props;
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
    (imageProps?.width as number) ||
    baseImgBuilderInstance.options.width ||
    (baseImgBuilderInstance.options.maxWidth
      ? Math.min(
          baseImgBuilderInstance.options.maxWidth,
          croppedImageDimensions.width
        )
      : croppedImageDimensions.width);

  const height =
    imageProps?.height ||
    baseImgBuilderInstance.options.height ||
    (baseImgBuilderInstance.options.maxHeight
      ? Math.min(
          baseImgBuilderInstance.options.maxHeight,
          croppedImageDimensions.height
        )
      : Math.round(width / croppedImageDimensions.aspectRatio));

  if (
    imageProps?.placeholder === "blur" &&
    imageProps?.blurDataURL === undefined
  ) {
    blurImgBuilderInstance = blurUpImageBuilder(urlFor(image).auto("format"), {
      width: null,
      originalImageDimensions,
      croppedImageDimensions,
      quality: null,
      blurAmount: null
    });
  }

  return (
    <Image
      loader={loader}
      src={imageProps?.src ?? baseImgBuilderInstance.url()}
      alt={imageProps?.alt}
      width={width}
      height={height}
      placeholder={blurImgBuilderInstance ? "blur" : undefined}
      blurDataURL={
        blurImgBuilderInstance ? blurImgBuilderInstance.url() : undefined
      }
      {...imageProps}
    />
  );
});

export default SanityNextImage;
