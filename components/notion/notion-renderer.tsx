'use client';

import * as React from 'react';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';

import 'katex/dist/katex.min.css';
import { useTheme } from 'next-themes';
import { type PageBlock } from 'notion-types';
import { formatDate } from 'notion-utils';
import 'react-notion-x/src/styles.css';

import * as types from '@/lib/types';
import { wrapNextImage, wrapNextLink } from '@/components/notion/next';
import { mapImageUrl } from '@/lib/map-image-url';
import { mapPageUrl } from '@/lib/map-page-url';

const CodeBlock = dynamic(
  () => import('@/components/blog/code-block').then((m) => m.CodeBlock),
  {
    ssr: false,
    loading: () => <pre className='notion-code' />,
  }
);

const _NotionRenderer = dynamic(
  () => import('react-notion-x').then((m) => m.NotionRenderer),
  { ssr: false }
);

const Collection = dynamic(() =>
  import('react-notion-x/build/third-party/collection').then(
    (m) => m.Collection
  )
);
const Equation = dynamic(() =>
  import('react-notion-x/build/third-party/equation').then((m) => m.Equation)
);
const Pdf = dynamic(
  () => import('react-notion-x/build/third-party/pdf').then((m) => m.Pdf),
  {
    ssr: false,
  }
);
const Modal = dynamic(
  () =>
    import('react-notion-x/build/third-party/modal').then((m) => {
      m.Modal.setAppElement('.notion-viewport');
      return m.Modal;
    }),
  {
    ssr: false,
  }
);

const propertyLastEditedTimeValue = (
  { block, pageHeader }: { block: PageBlock; pageHeader: boolean },
  defaultFn: () => React.ReactNode
) => {
  if (pageHeader && block?.last_edited_time) {
    return `Last updated ${formatDate(block?.last_edited_time, {
      month: 'long',
    })}`;
  }

  return defaultFn();
};

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

const propertyTextValue = (
  { schema, pageHeader }: { schema: any; pageHeader: boolean },
  defaultFn: () => React.ReactNode
) => {
  if (pageHeader && schema?.name?.toLowerCase() === 'author') {
    return <b>{defaultFn()}</b>;
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
  const { theme } = useTheme();

  const siteMapPageUrl = React.useMemo(() => {
    const params: any = {};

    const searchParams = new URLSearchParams(params);
    return mapPageUrl(site, recordMap, searchParams);
  }, [site, recordMap]);

  return (
    <_NotionRenderer
      darkMode={theme === 'dark'}
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
        Modal,
        Pdf,
        propertyLastEditedTimeValue,
        propertyTextValue,
        propertyDateValue,
      }}
      // fullPage={true}
      mapPageUrl={siteMapPageUrl}
      // @ts-expect-error mapImageUrl shouldn't return null
      mapImageUrl={mapImageUrl}
    />
  );
}
