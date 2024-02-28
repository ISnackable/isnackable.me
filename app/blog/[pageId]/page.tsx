import * as React from 'react';

import { notFound } from 'next/navigation';

import { NotionRenderer } from '@/components/notion/notion-renderer';
import { domain } from '@/lib/config';
import { getSiteMap } from '@/lib/get-site-map';
import { resolveNotionPage } from '@/lib/resolve-notion-page';
import '@/styles/notion.css';
import '@/styles/shiki.css';

export const revalidate = 60; // revalidate this page every 60 seconds
export const dynamicParams = false;

export async function generateStaticParams() {
  const siteMap = await getSiteMap();
  if (!siteMap?.canonicalPageMap) {
    return [];
  }

  console.log(
    'siteMap.canonicalPageMap',
    Object.keys(siteMap.canonicalPageMap)
  );

  return Object.keys(siteMap.canonicalPageMap).map((pageId) => ({
    pageId,
  }));
}

async function getPost(params: { pageId: string }) {
  const rawPageId = params.pageId;

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

export default async function Page({ params }: { params: { pageId: string } }) {
  const { error, site, recordMap } = await getPost(params);

  if (error || site === undefined || recordMap === undefined) {
    notFound();
  }

  return <NotionRenderer site={site} recordMap={recordMap} />;
}
