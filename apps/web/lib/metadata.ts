import { blog, legal, pages, projects, resume, settings } from "@repo/cms";
import type { PageRoute } from "@repo/cms/content/pages";
import { httpsUrl, resolveSiteSettings } from "@repo/cms/content/site";
import { contentText } from "@repo/cms/content/text";
import { getTranslationLinks } from "@repo/cms/content/translations";
import { getPortfolioDictionary } from "@repo/internationalization";
import {
  defaultLocale,
  isLocale,
  type Locale,
  locales,
} from "@repo/internationalization/locales";
import { createMetadata, openGraphLocale } from "@repo/seo/metadata";
import type { Metadata } from "next";
import { siteUrl } from "./site-url";

export type SeoRoute =
  | { kind: PageRoute | "resume" }
  | { kind: "post" | "project" | "legal"; slug: string };

const publishedSeo = { perspective: "published", stega: false } as const;

interface SeoContent {
  description?: string | null;
  image?: string | null;
  imageAlt?: string | null;
  languages: Record<string, string>;
  locale?: Locale;
  noIndex?: boolean;
  path: string;
  publishedTime?: string | null;
  title: string;
}

function sectionLinks(path: string) {
  return Object.fromEntries(
    locales.map((locale) => [locale, `/${locale}${path}`])
  );
}

async function getSectionSeo(
  kind: PageRoute,
  locale: Locale
): Promise<SeoContent> {
  const [document, dictionary] = await Promise.all([
    pages.get(kind, locale, publishedSeo),
    getPortfolioDictionary(locale),
  ]);
  const suffix = kind === "home" ? "" : `/${kind}`;
  return {
    title:
      document?.seo?.title ||
      document?.title ||
      dictionary.web[kind].meta.title,
    description: document?.seo?.description || document?.description,
    image: document?.seo?.image?.asset?.url,
    imageAlt: document?.seo?.image?.alt,
    noIndex: document?.seo?.noIndex,
    path: `/${locale}${suffix}`,
    languages: sectionLinks(suffix),
  };
}

async function getResumeSeo(locale: Locale): Promise<SeoContent | null> {
  const [profile, languages, dictionary] = await Promise.all([
    resume.get(locale, publishedSeo),
    resume.getLanguages(publishedSeo),
    getPortfolioDictionary(locale),
  ]);
  if (!(profile?.firstName && profile.lastName)) {
    return null;
  }
  const name = [profile.firstName, profile.lastName].join(" ");
  const path = `/${locale}/resume`;
  return {
    title: dictionary.web.resume.meta.title.replace("{name}", name),
    description:
      profile.headerQuote ||
      dictionary.web.resume.meta.description.replace("{name}", name),
    path,
    languages: {
      ...Object.fromEntries(
        languages
          .filter((entry) => isLocale(entry.language))
          .map((entry) => [entry.language, `/${entry.language}/resume`])
      ),
      [locale]: path,
    },
  };
}

async function getLegalSeo(
  locale: Locale,
  slug: string
): Promise<SeoContent | null> {
  const resolved = await legal.getPost(slug, locale, publishedSeo);
  if (!resolved) {
    return null;
  }
  const { document, locale: contentLocale, slug: contentSlug } = resolved;
  const dictionary = await getPortfolioDictionary(contentLocale);
  const suffix = `/legal/${encodeURIComponent(contentSlug)}`;
  return {
    title:
      document.seo?.title || document.title || dictionary.web.content.untitled,
    description: document.seo?.description || document.description,
    image: document.seo?.image?.asset?.url,
    imageAlt: document.seo?.image?.alt,
    noIndex: document.seo?.noIndex,
    path: `/${contentLocale}${suffix}`,
    locale: contentLocale,
    languages: getTranslationLinks(
      "legal",
      { locale: contentLocale, slug: contentSlug },
      document.translations
    ),
  };
}

async function getEntrySeo(
  kind: "post" | "project",
  locale: Locale,
  slug: string
): Promise<SeoContent | null> {
  const collection = kind === "post" ? "blog" : "projects";
  const [document, dictionary] = await Promise.all([
    (kind === "post" ? blog : projects).getPost(slug, locale, publishedSeo),
    getPortfolioDictionary(locale),
  ]);
  if (!document) {
    return null;
  }
  const description =
    "summary" in document ? document.summary : document.description;
  return {
    title:
      document.seo?.title || document.title || dictionary.web.content.untitled,
    description: document.seo?.description || description,
    image: document.seo?.image?.asset?.url,
    imageAlt: document.seo?.image?.alt,
    noIndex: document.seo?.noIndex,
    publishedTime: document.date,
    path: `/${locale}/${collection}/${encodeURIComponent(slug)}`,
    languages: getTranslationLinks(
      collection,
      { locale, slug },
      document.translations
    ),
  };
}

export function getSeoContent(route: SeoRoute, locale: Locale) {
  switch (route.kind) {
    case "blog":
    case "home":
    case "projects":
      return getSectionSeo(route.kind, locale);
    case "resume":
      return getResumeSeo(locale);
    case "legal":
      return getLegalSeo(locale, route.slug);
    default:
      return getEntrySeo(route.kind, locale, route.slug);
  }
}

export async function getSeoSite() {
  const document = await settings.get(publishedSeo);
  return {
    ...resolveSiteSettings(document),
    imageAlt: contentText(document?.ogImage?.alt),
  };
}

export async function createWebMetadata(
  route: SeoRoute,
  locale: Locale
): Promise<Metadata> {
  const content = await getSeoContent(route, locale);
  if (!content) {
    return {};
  }

  const {
    image: homepageImage,
    imageAlt: homepageImageAlt,
    ...site
  } = await getSeoSite();
  const pageImage = httpsUrl(content.image);
  const canonical = new URL(content.path, siteUrl);
  const fallback = content.languages[defaultLocale];
  const contentLocale = content.locale ?? locale;
  const alternateLocale = locales
    .filter(
      (language) => language !== contentLocale && content.languages[language]
    )
    .map(openGraphLocale);

  return createMetadata({
    title: contentText(content.title),
    description: contentText(content.description),
    image: pageImage || (route.kind === "home" ? homepageImage : undefined),
    imageAlt: pageImage ? contentText(content.imageAlt) : homepageImageAlt,
    locale: contentLocale,
    site,
    metadataBase: siteUrl,
    alternates: {
      // Next.js treats URL objects as bases for the requested path.
      canonical: route.kind === "legal" ? canonical.href : canonical,
      languages: {
        ...content.languages,
        ...(fallback && { "x-default": fallback }),
      },
    },
    openGraph: {
      type: route.kind === "post" ? "article" : "website",
      url: canonical,
      alternateLocale,
      ...(route.kind === "post" && {
        publishedTime: content.publishedTime || undefined,
      }),
    },
    robots: content.noIndex ? { index: false, follow: false } : undefined,
  });
}
