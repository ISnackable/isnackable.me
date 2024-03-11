import 'server-only';

import ExpiryMap from 'expiry-map';
import {
  getAllPagesInSpace,
  getPageProperty,
  idToUuid,
  normalizeTitle,
} from 'notion-utils';
import pMemoize from 'p-memoize';

import * as config from '@/lib/config';
import type * as types from '@/lib/types';
import { includeNotionIdInUrls } from '@/lib/config';
import { getCanonicalPageId } from '@/lib/get-canonical-page-id';
import { notion } from '@/lib/notion-api';

const uuid = !!includeNotionIdInUrls;
const cache = new ExpiryMap(10000);

export async function getSiteMap(): Promise<types.SiteMap> {
  if (config.rootNotionSpaceId === null) return {} as types.SiteMap;

  const partialSiteMap = await getAllPages(
    config.rootNotionPageId,
    config.rootNotionSpaceId
  );

  return {
    site: config.site,
    ...partialSiteMap,
  } as types.SiteMap;
}

const getAllPages = pMemoize(getAllPagesImpl, {
  cacheKey: (...args) => JSON.stringify(args),
  cache,
});

async function getAllPagesImpl(
  rootNotionPageId: string,
  rootNotionSpaceId: string
): Promise<Partial<types.SiteMap>> {
  const getPage = async (pageId: string, ...args: any[]) => {
    // console.log('\nnotion getPage', uuidToId(pageId));
    return notion.getPage(pageId, ...args);
  };

  const pageMap = await getAllPagesInSpace(
    rootNotionPageId,
    rootNotionSpaceId,
    getPage
  );

  // We don't want to include the root page in the sitemap
  try {
    delete pageMap[idToUuid(config.rootNotionPageId)];
  } catch (error) {
    console.error('error deleting rootNotionPageId', error);
  }

  const canonicalPageMap = Object.keys(pageMap).reduce(
    (
      map: {
        canonicalPageMap: { [key: string]: string };
        slug: { [key: string]: string };
      },
      pageId: string
    ) => {
      const recordMap = pageMap[pageId];
      if (!recordMap) {
        throw new Error(`Error loading page "${pageId}"`);
      }

      const block = recordMap.block[pageId]?.value;
      const isCollection =
        block.type === 'page' && block.parent_table === 'collection';

      if (
        !(getPageProperty<boolean | null>('Public', block, recordMap) ?? true)
      ) {
        return map;
      }

      const canonicalPageId = getCanonicalPageId(pageId, recordMap, {
        uuid,
      });

      if (canonicalPageId === null) return map;

      const collectionSlug = normalizeTitle(
        recordMap.collection[block.parent_id]?.value?.name[0][0]
      );
      const slug = collectionSlug
        ? `${collectionSlug}/${canonicalPageId}`
        : canonicalPageId;

      if (
        isCollection &&
        getPageProperty<string | null>('URL', block, recordMap)
      ) {
        return map;
      }

      if (map.canonicalPageMap[canonicalPageId]) {
        // you can have multiple pages in different collections that have the same id
        // TODO: we may want to error if neither entry is a collection page
        console.warn('error duplicate canonical page id', {
          canonicalPageId,
          pageId,
          existingPageId: map.canonicalPageMap[slug], // Add an index signature to allow indexing with a string
        });

        return map;
      } else {
        return {
          ...map,
          canonicalPageMap: {
            ...map.canonicalPageMap,
            [canonicalPageId]: pageId,
          },
          slug: {
            ...map.slug,
            [slug]: pageId,
          },
        };
      }
    },
    {
      canonicalPageMap: {},
      slug: {},
    }
  );

  return {
    pageMap,
    ...canonicalPageMap,
  };
}
