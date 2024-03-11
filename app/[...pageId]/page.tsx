import * as React from 'react';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { NotionRenderer } from '@/components/notion/notion-renderer';
import { domain } from '@/lib/config';
import { getSiteMap } from '@/lib/get-site-map';
import { resolveNotionPage } from '@/lib/resolve-notion-page';

export const revalidate = 60; // revalidate this page every 60 seconds
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: { pageId: string[] };
}) {
  //   const { error, site, recordMap } = await getPage(params);
  const rawPageId = params.pageId[1] || params.pageId[0];

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

export async function generateStaticParams() {
  const siteMap = await getSiteMap();
  if (!siteMap?.slug) {
    return [];
  }

  console.log('siteMap.slug', siteMap.slug);

  return Object.keys(siteMap.slug).map((pageId) => ({
    pageId: pageId.split('/'),
  }));
}

async function getPage(params: { pageId: string[] }) {
  const rawPageId = params.pageId[1] || params.pageId[0];

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

  console.log('recordMap', error, site, recordMap);

  if (error || site === undefined || recordMap === undefined) {
    notFound();
  }

  return <NotionRenderer site={site} recordMap={recordMap} />;
}
