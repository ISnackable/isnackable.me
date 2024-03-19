import type { ExtendedRecordMap } from 'notion-types';
import { normalizeTitle, parsePageId, uuidToId } from 'notion-utils';

import { includeNotionIdInUrls } from '@/lib/config';
import { getCanonicalPageBreadcrumbs } from '@/lib/get-canonical-page-breadcrumbs';
import { getCanonicalPageId } from '@/lib/get-canonical-page-id';
import type { Site } from '@/lib/types';

// include UUIDs in page URLs during local development but not in production
// (they're nice for debugging and speed up local dev)
const uuid = !!includeNotionIdInUrls;

export const mapPageUrl =
  (site: Site, recordMap: ExtendedRecordMap, searchParams: URLSearchParams) =>
  (pageId = '') => {
    const pageUuid = parsePageId(pageId, { uuid: true });

    if (uuidToId(pageUuid) === site.rootNotionPageId) {
      return createUrl('/', searchParams);
    } else {
      const block = recordMap.block[pageId]?.value;
      const breadcrumbs = getCanonicalPageBreadcrumbs(recordMap, pageId);

      if (breadcrumbs) {
        // Check if rootNotionPageId
        breadcrumbs.shift();

        const collectionSlug = normalizeTitle(
          recordMap.collection[block.parent_id]?.value?.name[0][0] ||
            recordMap.collection[breadcrumbs[0].block.parent_id]?.value
              ?.name[0][0]
        );

        if (collectionSlug) {
          breadcrumbs.unshift({
            // title: collectionPages.get(block.parent_id) || collectionSlug,
            title: collectionSlug,
            id: block.parent_id,
          });
        }

        const slug = breadcrumbs.map((b) => normalizeTitle(b.title)).join('/');
        return createUrl(`/${slug}`, searchParams);
      }

      return createUrl(
        `/${getCanonicalPageId(pageUuid, recordMap, { uuid })}`,
        searchParams
      );
    }
  };

export const getCanonicalPageUrl =
  (site: Site, recordMap: ExtendedRecordMap) =>
  (pageId = '') => {
    const pageUuid = parsePageId(pageId, { uuid: true });

    if (uuidToId(pageId) === site.rootNotionPageId) {
      return `https://${site.domain}`;
    } else {
      const block = recordMap.block[pageId]?.value;
      const breadcrumbs = getCanonicalPageBreadcrumbs(recordMap, pageId);

      if (breadcrumbs) {
        // Check if rootNotionPageId
        breadcrumbs.shift();

        const collectionSlug = normalizeTitle(
          recordMap.collection[block.parent_id]?.value?.name[0][0] ||
            recordMap.collection[breadcrumbs[0].block.parent_id]?.value
              ?.name[0][0]
        );

        if (collectionSlug) {
          breadcrumbs.unshift({
            // title: collectionPages.get(block.parent_id) || collectionSlug,
            title: collectionSlug,
            id: block.parent_id,
          });
        }

        const slug = breadcrumbs.map((b) => normalizeTitle(b.title)).join('/');
        return `https://${site.domain}/${slug}`;
      }

      return `https://${site.domain}/${getCanonicalPageId(pageUuid, recordMap, {
        uuid,
      })}`;
    }
  };

function createUrl(path: string, searchParams: URLSearchParams) {
  return [path, searchParams.toString()].filter(Boolean).join('?');
}
