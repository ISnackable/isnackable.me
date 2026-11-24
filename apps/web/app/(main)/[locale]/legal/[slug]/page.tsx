import { legal } from "@repo/cms";
import { PortableText } from "@repo/cms/components/portable-text";
import { getPortfolioDictionary } from "@repo/internationalization";
import {
  defaultLocale,
  isLocale,
  locales,
} from "@repo/internationalization/locales";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPortfolioLocale } from "@/i18n/locale";
import { createWebMetadata } from "@/lib/metadata";
import ContentLoading from "../../components/content-loading";

interface LegalPageProperties {
  readonly params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export const generateMetadata = async ({
  params,
}: LegalPageProperties): Promise<Metadata> => {
  const { slug } = await params;
  const locale = await getPortfolioLocale();
  return createWebMetadata({ kind: "legal", slug }, locale);
};

// Wait for complete cached output on direct visits, including real HTTP 404s.
export const ensureStatic = "navigation";

export const generateStaticParams = async (): Promise<
  { locale: string; slug: string }[]
> => {
  const paths = (await legal.getSlugs()).flatMap(({ slug, language }) => {
    const locale = language ?? defaultLocale;
    return slug && isLocale(locale) ? [{ locale, slug }] : [];
  });
  return paths.length
    ? paths
    : locales.map((locale) => ({ locale, slug: "__empty__" }));
};

const LegalPage = async ({ params }: LegalPageProperties) => {
  const { slug } = await params;
  const locale = await getPortfolioLocale();
  const resolved = await legal.getPost(slug, locale);

  if (!resolved) {
    notFound();
  }

  const { document: page, locale: contentLocale } = resolved;
  const dictionary = await getPortfolioDictionary(contentLocale);
  const body = page.content ?? [];

  return (
    <div
      className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6"
      lang={contentLocale}
    >
      <h1 className="scroll-m-20 text-balance font-extrabold text-4xl tracking-tight lg:text-5xl">
        {page.title ?? dictionary.web.content.untitled}
      </h1>
      {page.description ? (
        <p className="text-balance leading-7 [&:not(:first-child)]:mt-6">
          {page.description}
        </p>
      ) : null}
      <div className="mt-16 flex flex-col items-start gap-8 sm:flex-row">
        <div className="w-full min-w-0 sm:flex-1">
          <div className="article-measure typeset typeset-article">
            <PortableText value={body} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Page(properties: LegalPageProperties) {
  return (
    <Suspense fallback={<ContentLoading variant="legal" />}>
      <LegalPage {...properties} />
    </Suspense>
  );
}
