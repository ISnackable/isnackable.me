'use client';

import * as React from 'react';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';

import { formatDate, getTextContent } from 'notion-utils';
import {
  NotionRenderer as _NotionRenderer,
  useNotionContext,
} from 'react-notion-x';
import 'react-notion-x/src/styles.css';

import type * as types from '@/lib/types';
import type { Format } from '@/components/blog/mermaid';
import { wrapNextImage, wrapNextLink } from '@/components/notion/next';
import { mapImageUrl } from '@/lib/map-image-url';
import { mapPageUrl } from '@/lib/map-page-url';
import '@/styles/notion.css';

const CodeBlock = dynamic(async () => {
  return function CodeSwitch({ block }: { block: types.CodeBlock }) {
    const format: Format = block.format;
    if (
      getTextContent(block.properties.language) === 'Mermaid' &&
      format.code_preview_format === 'preview'
    ) {
      return React.createElement(
        dynamic(() => {
          return import('@/components/blog/mermaid').then((m) => m.Mermaid);
        }),
        { block }
      );
    }

    return React.createElement(
      dynamic(
        () => import('@/components/blog/code-block').then((m) => m.CodeBlock),
        {
          loading: () => (
            <pre className='notion-code'>
              <code></code>
            </pre>
          ),
        }
      ),
      { block }
    );
  };
});
const Collection = dynamic(() =>
  import('react-notion-x/build/third-party/collection').then(
    (m) => m.Collection
  )
);
const Equation = dynamic(() => import('@/components/notion/equation'));
const Pdf = dynamic(
  () => import('react-notion-x/build/third-party/pdf').then((m) => m.Pdf),
  {
    ssr: false,
  }
);

const propertyDateValue = (
  { data, schema, pageHeader }: { data: any; schema: any; pageHeader: boolean },
  defaultFn: () => React.ReactNode
) => {
  if (pageHeader && schema?.name?.toLowerCase() === 'published') {
    const publishDate = data?.[0]?.[1]?.[0]?.[1]?.start_date;

    if (publishDate) {
      return `${formatDate(publishDate, {
        month: 'long',
      })}`;
    }
  }

  return defaultFn();
};

const PropertyPersonValue = (
  { data, schema, pageHeader }: { data: any; schema: any; pageHeader: boolean },
  defaultFn: () => React.ReactNode
) => {
  const ctx = useNotionContext();
  const userId = data[0][1][0][1];
  const user = ctx.recordMap.notion_user[userId];

  if (pageHeader && schema?.name?.toLowerCase() === 'author') {
    return (
      <>
        {defaultFn()}
        {/* @ts-ignore */}
        <b className='ml-1'>{user?.value.name}</b>
      </>
    );
  }

  return defaultFn();
};

export function NotionRenderer({
  site,
  recordMap,
}: {
  site: types.Site;
  recordMap: types.ExtendedRecordMap;
}) {
  const siteMapPageUrl = React.useMemo(() => {
    const params: any = {};

    const searchParams = new URLSearchParams(params);
    return mapPageUrl(site, recordMap, searchParams);
  }, [site, recordMap]);

  // estimatePageReadTime(recordMap.block, recordMap)

  return (
    <_NotionRenderer
      fullPage
      disableHeader
      recordMap={recordMap}
      previewImages={!!recordMap.preview_images}
      showCollectionViewDropdown={false}
      components={{
        Image: wrapNextImage(Image),
        Link: wrapNextLink(Link),
        PageLink: wrapNextLink(Link),
        Code: CodeBlock,
        Collection,
        Equation,
        Pdf,
        propertyPersonValue: PropertyPersonValue,
        propertyDateValue,
      }}
      mapPageUrl={siteMapPageUrl}
      // @ts-expect-error mapImageUrl shouldn't return null
      mapImageUrl={mapImageUrl}
    />
  );
}
