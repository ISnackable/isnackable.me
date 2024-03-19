import * as React from 'react';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { NotionRenderer } from '@/components/notion/notion-renderer';
import { domain } from '@/lib/config';
import { getPageProperty } from '@/lib/get-page-property';
import { getSiteMap } from '@/lib/get-site-map';
import { getUsers } from '@/lib/notion';
import { resolveNotionPage } from '@/lib/resolve-notion-page';

export const revalidate = 60; // revalidate this page every 60 seconds
export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: { pageId: string[] };
}) {
  //   const { error, site, recordMap } = await getPage(params);
  const rawPageId = params.pageId.pop();

  return {
    title: rawPageId,
    openGraph: {
      images: [
        {
          url: `/og/${rawPageId}`,
        },
      ],
    },
  } satisfies Metadata;
}

// https://github.com/vercel/next.js/issues/54270
// workaround: (putting dynamic = 'force-static' seems to fix the issue)
export async function generateStaticParams() {
  const siteMap = await getSiteMap();
  if (!siteMap.slug.length) {
    return [];
  }

  return siteMap.slug.map((pageId) => ({
    pageId: pageId.split('/'),
  }));
}

async function getPage(params: { pageId: string[] }) {
  const rawPageId = params.pageId.pop();

  try {
    const props = await resolveNotionPage(domain, rawPageId);

    return props;
  } catch (err) {
    console.error('page error', domain, rawPageId, err);

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err;
  }
}

export default async function Page({
  params,
}: {
  params: { pageId: string[] };
}) {
  const { error, site, recordMap } = await getPage(params);

  if (error || site === undefined || recordMap === undefined) {
    notFound();
  }

  const keys = Object.keys(recordMap?.block || {});
  const block = recordMap?.block?.[keys[0]]?.value;

  const authorId = getPageProperty<string | null>('author', block, recordMap);
  if (authorId) {
    const authors = await getUsers([authorId]);
    recordMap.notion_user = authors.recordMapWithRoles.notion_user;
  }

  return <NotionRenderer site={site} recordMap={recordMap} />;
}
