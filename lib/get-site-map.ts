import 'server-only';

import { getAllPagesInSpace, getPageProperty, uuidToId } from 'notion-utils';
import pMemoize from 'p-memoize';

import * as config from '@/lib/config';
import type * as types from '@/lib/types';
import { includeNotionIdInUrls } from '@/lib/config';
import { getCanonicalPageId } from '@/lib/get-canonical-page-id';
import { notion } from '@/lib/notion-api';

const uuid = !!includeNotionIdInUrls;

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

  const filteredPageMap = pageMapInsideCollection(pageMap);

  const canonicalPageMap = Object.keys(filteredPageMap).reduce(
    (map: { [key: string]: string }, pageId: string) => {
      const recordMap = pageMap[pageId];
      if (!recordMap) {
        throw new Error(`Error loading page "${pageId}"`);
      }

      const block = recordMap.block[pageId]?.value;
      if (
        !(getPageProperty<boolean | null>('Public', block, recordMap) ?? true)
      ) {
        return map;
      }

      const canonicalPageId = getCanonicalPageId(pageId, recordMap, {
        uuid,
      });

      if (canonicalPageId === null) return map;

      if (map[canonicalPageId]) {
        // you can have multiple pages in different collections that have the same id
        // TODO: we may want to error if neither entry is a collection page
        console.warn('error duplicate canonical page id', {
          canonicalPageId,
          pageId,
          existingPageId: map[canonicalPageId], // Add an index signature to allow indexing with a string
        });

        return map;
      } else {
        return {
          ...map,
          [canonicalPageId]: pageId,
        };
      }
    },
    {}
  );

  return {
    pageMap,
    canonicalPageMap,
  };
}

function pageMapInsideCollection(pageMap: types.PageMap) {
  for (const pageId in pageMap) {
    const recordMap = pageMap[pageId];
    if (!recordMap) {
      throw new Error(`Error loading page "${pageId}"`);
    }

    // if it's not a collection
    if (
      Object.keys(recordMap.collection).length === 0 ||
      uuidToId(pageId) === config.rootNotionPageId
    ) {
      delete pageMap[pageId];
    }
  }

  return pageMap;
}
