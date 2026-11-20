import { siteConfig } from "@repo/config/site";
import { getBaseUrl } from "@repo/config/url";
import merge from "lodash.merge";
import type { Metadata } from "next";

export interface MetadataIdentity {
  author?: { name: string; url: string };
  description?: string;
  image?: string;
  imageAlt?: string;
  name: string;
  publisher?: string;
  twitterHandle?: string;
}

export type MetadataGenerator = Omit<Metadata, "description" | "title"> & {
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  locale?: string;
  site?: MetadataIdentity;
};

const ogLocaleMap: Record<string, string> = {
  en: "en_US",
  ja: "ja_JP",
  zh: "zh_CN",
};

export const openGraphLocale = (locale: string) =>
  ogLocaleMap[locale] || "en_US";

/** Pure metadata generation: callers supply identity from their content source. */
export const createMetadata = ({
  title,
  description,
  image,
  imageAlt,
  locale,
  site = { name: siteConfig.applicationName },
  ...properties
}: MetadataGenerator): Metadata => {
  const parsedTitle = `${title} | ${site.name}`;
  const summary = description || site.description || "";
  const author = site.author?.name
    ? {
        name: site.author.name,
        ...(site.author.url ? { url: site.author.url } : {}),
      }
    : undefined;
  const defaultMetadata: Metadata = {
    title: parsedTitle,
    description: summary,
    applicationName: site.name,
    metadataBase: getBaseUrl(
      process.env.VERCEL_PROJECT_PRODUCTION_URL,
      process.env.NEXT_PUBLIC_WEB_URL
    ),
    authors: author ? [author] : undefined,
    creator: author?.name,
    publisher: site.publisher || site.name,
    formatDetection: { telephone: false },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: parsedTitle,
    },
    openGraph: {
      title: parsedTitle,
      description: summary,
      type: "website",
      siteName: site.name,
      locale: openGraphLocale(locale ?? "en"),
    },
    twitter: {
      card: "summary_large_image",
      creator: site.twitterHandle || undefined,
    },
  };
  const metadata: Metadata = merge(defaultMetadata, properties);
  const socialImage = image || site.image;
  if (socialImage) {
    const alt = image ? imageAlt : site.imageAlt;
    if (metadata.openGraph) {
      metadata.openGraph.images = [{ url: socialImage, alt: alt || title }];
    }
    if (metadata.twitter) {
      metadata.twitter.images = alt
        ? [{ url: socialImage, alt }]
        : [socialImage];
    }
  }
  return metadata;
};
