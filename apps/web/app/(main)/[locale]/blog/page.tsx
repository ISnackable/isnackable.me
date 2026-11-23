import {
  type BLOG_INDEX_QUERY_RESULT,
  type BlogFilters,
  blog,
  pages,
  postsPerPage,
} from "@repo/cms";
import { contentText } from "@repo/cms/content/text";
import {
  getPortfolioDictionary,
  type PortfolioDictionary,
  routing,
} from "@repo/internationalization";
import type { Blog, WithContext } from "@repo/seo/json-ld";
import { JsonLd } from "@repo/seo/json-ld";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getPortfolioLocale } from "@/i18n/locale";
import { blogHref, parseBlogFilters } from "@/lib/blog-discovery";
import { createWebMetadata } from "@/lib/metadata";
import { ContentEmpty } from "../components/content-empty";
import ContentLoading, {
  BlogResultsLoading,
} from "../components/content-loading";
import { BlogCard } from "./components/blog-card";
import { BlogPagination } from "./components/blog-pagination";
import { BlogFiltersForm } from "./components/filters";
import { ResultsShell } from "./components/results-shell";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const generateMetadata = async (): Promise<Metadata> =>
  createWebMetadata({ kind: "blog" }, await getPortfolioLocale());

interface BlogIndexProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const BlogIndex = async ({ searchParams }: BlogIndexProps) => {
  const locale = await getPortfolioLocale();
  const [dictionary, document] = await Promise.all([
    getPortfolioDictionary(locale),
    pages.get("blog", locale),
  ]);

  const jsonLd: WithContext<Blog> = {
    "@type": "Blog",
    "@context": "https://schema.org",
  };

  return (
    <>
      <JsonLd code={jsonLd} />
      <main className="portfolio-content site-shell content-page">
        <header className="page-heading">
          <p className="section-label">{dictionary.web.content.writingLabel}</p>
          <h1>
            {contentText(document?.title) || dictionary.web.blog.meta.title}
          </h1>
          {contentText(document?.description) ? (
            <p className="page-description">{document?.description}</p>
          ) : null}
        </header>
        <Suspense
          fallback={
            <BlogResultsFallback dictionary={dictionary} locale={locale} />
          }
        >
          <BlogResults
            dictionary={dictionary}
            locale={locale}
            searchParams={searchParams}
          />
        </Suspense>
      </main>
    </>
  );
};

async function BlogResults({
  searchParams,
  locale,
  dictionary,
}: BlogIndexProps & { locale: string; dictionary: PortfolioDictionary }) {
  const filters = parseBlogFilters(await searchParams);

  const result = await blog.getIndex(locale, filters);
  const { total } = result;
  const pageCount = Math.max(1, Math.ceil(total / postsPerPage));
  if (filters.page > pageCount) {
    redirect(blogHref(locale, { ...filters, page: pageCount }));
  }
  return (
    <BlogResultsView
      dictionary={dictionary}
      filters={filters}
      locale={locale}
      result={result}
    />
  );
}

interface ResultsProps {
  dictionary: PortfolioDictionary;
  filters: BlogFilters;
  locale: string;
  result: BLOG_INDEX_QUERY_RESULT;
}

async function BlogResultsFallback({
  dictionary,
  locale,
}: Pick<ResultsProps, "dictionary" | "locale">) {
  const filters = { page: 1, q: "", tag: "" };
  const result = await blog.getIndex(locale, filters);
  const loading = <BlogResultsLoading />;
  return (
    <Suspense fallback={loading}>
      <ResultsShell loading={loading}>
        <BlogResultsView
          dictionary={dictionary}
          filters={filters}
          locale={locale}
          result={result}
        />
      </ResultsShell>
    </Suspense>
  );
}

function BlogResultsView({
  dictionary,
  locale,
  filters,
  result,
}: ResultsProps) {
  const { posts, total } = result;
  const tags = result.tags.filter((tag): tag is string => Boolean(tag));
  const pageCount = Math.max(1, Math.ceil(total / postsPerPage));
  const copy = dictionary.web.blog.discovery;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <BlogFiltersForm
        copy={copy}
        filters={filters}
        locale={locale}
        tags={tags}
      />
      <p className="text-muted-foreground text-sm" role="status">
        {copy.results.replace("{count}", String(total))}
      </p>
      {posts.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard
              copy={dictionary.web.content}
              headingLevel={2}
              key={post._id}
              locale={locale}
              post={post}
            />
          ))}
        </div>
      ) : (
        <ContentEmpty
          description={
            filters.q || filters.tag
              ? copy.noResultsBody
              : dictionary.web.content.writingEmptyBody
          }
          title={
            filters.q || filters.tag
              ? copy.noResults
              : dictionary.web.content.writingEmpty
          }
        />
      )}
      <BlogPagination
        copy={copy}
        filters={filters}
        locale={locale}
        pageCount={pageCount}
      />
    </div>
  );
}

export default function Page(props: BlogIndexProps) {
  return (
    <Suspense fallback={<ContentLoading variant="blog" />}>
      <BlogIndex {...props} />
    </Suspense>
  );
}
