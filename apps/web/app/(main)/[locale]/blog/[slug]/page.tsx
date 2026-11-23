import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { blog } from "@repo/cms";
import { Toc } from "@repo/cms/components/toc";
import { getTableOfContents } from "@repo/cms/content/rich-text/headings";
import { getReadingTime } from "@repo/cms/content/rich-text/reading-time";
import { Comments } from "@repo/comments";
import { getGiscusConfig } from "@repo/comments/config";
import { getPortfolioDictionary, routing } from "@repo/internationalization";
import { isLocale, type Locale } from "@repo/internationalization/locales";
import { JsonLd } from "@repo/seo/json-ld";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { env } from "@/env";
import { getPortfolioLocale } from "@/i18n/locale";
import { articleDiscussionTerm } from "@/lib/comments";
import { createWebMetadata } from "@/lib/metadata";
import { siteUrl } from "@/lib/site-url";
import { ArticleBody } from "../../components/article-body";
import { ArticleMeta } from "../../components/article-meta";
import ContentLoading from "../../components/content-loading";
import { Sidebar } from "../components/sidebar";

const commentsConfig = getGiscusConfig(env);

async function ArticleComments({
  documentId,
  locale,
  title,
}: {
  documentId: string;
  locale: string;
  title: string;
}) {
  if (!commentsConfig || (await draftMode()).isEnabled) {
    return null;
  }
  return (
    <section aria-labelledby="comments-heading" className="article-measure">
      <h2 className="mb-6 font-semibold text-2xl" id="comments-heading">
        {title}
      </h2>
      <Comments
        config={commentsConfig}
        locale={locale}
        term={articleDiscussionTerm(documentId)}
      />
    </section>
  );
}

interface BlogPostProperties {
  readonly params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export const generateMetadata = async ({
  params,
}: BlogPostProperties): Promise<Metadata> => {
  const { slug } = await params;
  const locale = await getPortfolioLocale();
  return createWebMetadata({ kind: "post", slug }, locale);
};

// Wait for complete cached output on direct visits, including real HTTP 404s.
export const ensureStatic = "navigation";

export const generateStaticParams = async (): Promise<
  { locale: string; slug: string }[]
> => {
  const slugs = await blog.getSlugs();
  // Only emit supported locale/slug pairs with actual published documents.
  const paths = slugs
    .filter(
      (s): s is { slug: string; language: Locale } =>
        Boolean(s.slug) && isLocale(s.language)
    )
    .map(({ slug, language }) => ({ locale: language, slug }));
  // An empty collection still validates the normal query and notFound path.
  return paths.length > 0
    ? paths
    : routing.locales.map((locale) => ({ locale, slug: "__empty__" }));
};

const BlogPost = async ({ params }: BlogPostProperties) => {
  const { slug } = await params;
  const locale = await getPortfolioLocale();

  const [post, dictionary] = await Promise.all([
    blog.getPost(slug, locale),
    getPortfolioDictionary(locale),
  ]);

  if (!post) {
    notFound();
  }

  const body = post.content ?? [];
  const tocItems = getTableOfContents(body);
  const readingTime = dictionary.web.content.readTime.replace(
    "{minutes}",
    String(getReadingTime(body))
  );

  const postDate = post.date || undefined;
  const postSlug = post.slug ?? slug;

  return (
    <>
      <JsonLd
        code={{
          "@type": "BlogPosting",
          "@context": "https://schema.org",
          datePublished: postDate,
          description: post.description ?? undefined,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": new URL(
              `/${locale}/blog/${encodeURIComponent(postSlug)}`,
              siteUrl
            ).toString(),
          },
          headline: post.title ?? dictionary.web.content.untitled,
          image: post.image?.asset?.url ?? undefined,
          dateModified: postDate,
          author: post.authors?.at(0)?.name ?? undefined,
          isAccessibleForFree: true,
        }}
      />
      <main className="portfolio-content mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid min-w-0 grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_14rem]">
          <div className="flex min-w-0 flex-col gap-8">
            <div className="article-measure text-lg">
              <Link
                className="inline-flex min-h-6 items-center gap-2 rounded-sm text-muted-foreground text-sm underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4"
                href={`/${locale}/blog`}
              >
                <ArrowLeftIcon aria-hidden="true" className="size-4" />
                {dictionary.web.content.backToBlog}
              </Link>
            </div>
            <ArticleBody
              content={body}
              description={post.description}
              image={post.image}
              metadata={
                <ArticleMeta
                  author={post.authors?.at(0)?.name}
                  date={post.date}
                  locale={locale}
                  readingTime={readingTime}
                />
              }
              title={post.title ?? dictionary.web.content.untitled}
            />
            {post.commentsEnabled ? (
              <Suspense fallback={null}>
                <ArticleComments
                  documentId={post._id}
                  locale={locale}
                  title={dictionary.web.blog.discovery.comments}
                />
              </Suspense>
            ) : null}
          </div>
          <aside className="sticky top-24 hidden max-h-[calc(100dvh-8rem)] self-start overflow-y-auto lg:block">
            <Sidebar
              copy={dictionary.web.content}
              tags={post.tags ?? []}
              toc={
                tocItems.length > 0 ? (
                  <Toc
                    items={tocItems}
                    label={dictionary.web.content.onThisPage}
                  />
                ) : null
              }
            />
          </aside>
        </div>
      </main>
    </>
  );
};

export default function Page(properties: BlogPostProperties) {
  return (
    <Suspense fallback={<ContentLoading />}>
      <BlogPost {...properties} />
    </Suspense>
  );
}
