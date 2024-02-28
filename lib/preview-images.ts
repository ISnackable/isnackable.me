import 'server-only';

import lqip from 'lqip-modern';
import type {
  ExtendedRecordMap,
  PreviewImage,
  PreviewImageMap,
} from 'notion-types';
import { getPageImageUrls, normalizeUrl } from 'notion-utils';
import pMap from 'p-map';
import pMemoize from 'p-memoize';

import { defaultPageCover, defaultPageIcon } from '@/lib/config';
import { db } from '@/lib/db';
import { mapImageUrl } from '@/lib/map-image-url';

export async function getPreviewImageMap(
  recordMap: ExtendedRecordMap
): Promise<PreviewImageMap> {
  const urls: string[] = [
    ...getPageImageUrls(recordMap, {
      mapImageUrl,
    }),
    defaultPageIcon,
    defaultPageCover,
  ].filter((url): url is string => url !== null);

  const previewImagesMap = Object.fromEntries(
    await pMap(
      urls,
      async (url) => {
        const cacheKey = normalizeUrl(url);
        return [cacheKey, await getPreviewImage(url, { cacheKey })];
      },
      {
        concurrency: 8,
      }
    )
  );

  return previewImagesMap;
}

async function createPreviewImage(
  url: string,
  { cacheKey }: { cacheKey: string }
): Promise<PreviewImage | null> {
  try {
    try {
      const cachedPreviewImage = await db.get(cacheKey);
      if (cachedPreviewImage) {
        return cachedPreviewImage;
      }
    } catch (err) {
      // ignore redis errors
      if (err instanceof Error)
        console.warn(`redis error get "${cacheKey}"`, err.message);
    }

    const response = await fetch(url, { cache: 'no-store' });
    const arrayBuffer = await response.arrayBuffer();
    const body = Buffer.from(arrayBuffer);
    const result = await lqip(body);
    // console.log("lqip", { ...result.metadata, url, cacheKey });

    const previewImage = {
      originalWidth: result.metadata.originalWidth,
      originalHeight: result.metadata.originalHeight,
      dataURIBase64: result.metadata.dataURIBase64,
    };

    try {
      await db.set(cacheKey, previewImage);
    } catch (err) {
      // ignore redis errors
      if (err instanceof Error)
        console.warn(`redis error set "${cacheKey}"`, err.message);
    }

    return previewImage;
  } catch (err) {
    if (err instanceof Error)
      console.warn('failed to create preview image', url, err.message);
    return null;
  }
}

export const getPreviewImage = pMemoize(createPreviewImage);
