import * as types from 'notion-types';
import { getBlockIcon, getBlockParentPage, getBlockTitle } from 'notion-utils';

import { includeNotionIdInUrls } from '@/lib/config';
import { getCanonicalPageId } from '@/lib/get-canonical-page-id';

const uuid = !!includeNotionIdInUrls;

export function getCanonicalPageBreadcrumbs(
  recordMap: types.ExtendedRecordMap,
  activePageId: string
): Array<any> | null {
  const blockMap = recordMap.block;
  const breadcrumbs = [];

  let currentPageId = activePageId;

  do {
    const block = blockMap[currentPageId]?.value;
    if (!block) {
      break;
    }

    const title = getBlockTitle(block, recordMap);
    const canonicalPageId = getCanonicalPageId(currentPageId, recordMap, {
      uuid,
    });
    const icon = getBlockIcon(block, recordMap);

    if (!(title || icon)) {
      break;
    }

    breadcrumbs.push({
      block,
      active: currentPageId === activePageId,
      pageId: currentPageId,
      title: canonicalPageId ? canonicalPageId : title,
      icon,
    });

    const parentBlock = getBlockParentPage(block, recordMap);
    const parentId = parentBlock?.id;

    if (!parentId) {
      break;
    }

    currentPageId = parentId;

    // eslint-disable-next-line no-constant-condition
  } while (true);

  breadcrumbs.reverse();

  return breadcrumbs;
}
