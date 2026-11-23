import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { projects, settings } from "@repo/cms";
import { getReadingTime } from "@repo/cms/content/rich-text/reading-time";
import { resolveSiteSettings } from "@repo/cms/content/site";
import { getPortfolioDictionary, routing } from "@repo/internationalization";
import { isLocale, type Locale } from "@repo/internationalization/locales";
import { JsonLd } from "@repo/seo/json-ld";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPortfolioLocale } from "@/i18n/locale";
import { createWebMetadata } from "@/lib/metadata";
import { siteUrl } from "@/lib/site-url";
import { ArticleBody } from "../../components/article-body";
import { ArticleMeta } from "../../components/article-meta";
import ContentLoading from "../../components/content-loading";
import { ProjectCard } from "../components/project-card";
import { ProjectFacts } from "../components/project-facts";

interface ProjectDetailProps {
  readonly params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export const generateMetadata = async ({
  params,
}: ProjectDetailProps): Promise<Metadata> => {
  const { slug } = await params;
  const locale = await getPortfolioLocale();
  return createWebMetadata({ kind: "project", slug }, locale);
};

// Wait for complete cached output on direct visits, including real HTTP 404s.
export const ensureStatic = "navigation";

export const generateStaticParams = async (): Promise<
  { locale: string; slug: string }[]
> => {
  const slugs = await projects.getSlugs();
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

const ProjectDetail = async ({ params }: ProjectDetailProps) => {
  const { slug } = await params;
  const locale = await getPortfolioLocale();

  const [project, dictionary, otherProjects, siteDocument] = await Promise.all([
    projects.getPost(slug, locale),
    getPortfolioDictionary(locale),
    projects.getMeta(locale, 4),
    settings.get({ stega: false }),
  ]);

  if (!project) {
    notFound();
  }

  const site = resolveSiteSettings(siteDocument);
  const body = project.content ?? [];

  const related = otherProjects
    .filter((item) => item._id !== project._id)
    .slice(0, 2);
  const projectDate = project.date || undefined;
  const projectSlug = project.slug ?? slug;

  return (
    <>
      <JsonLd
        code={{
          "@type": "Article",
          "@context": "https://schema.org",
          datePublished: projectDate,
          dateModified: projectDate,
          description: project.summary ?? undefined,
          headline: project.title ?? dictionary.web.content.untitled,
          image: project.coverImage?.asset?.url ?? undefined,
          author: site.author.name
            ? {
                "@type": "Person",
                name: site.author.name,
                url: site.author.url || undefined,
              }
            : undefined,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": new URL(
              `/${locale}/projects/${encodeURIComponent(projectSlug)}`,
              siteUrl
            ).toString(),
          },
        }}
      />
      <main className="portfolio-content site-shell content-page">
        <div className="flex flex-wrap items-center justify-between gap-4 text-lg">
          <Link
            className="inline-flex min-h-6 items-center gap-2 rounded-sm text-muted-foreground text-sm underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4"
            href={`/${locale}/projects`}
          >
            <ArrowLeftIcon aria-hidden="true" className="size-4" />
            {dictionary.web.projects.detail.backLabel}
          </Link>
        </div>
        <ArticleBody
          content={body}
          description={project.summary}
          image={project.coverImage}
          metadata={
            <div className="flex flex-col gap-5">
              <ArticleMeta
                date={project.date}
                locale={locale}
                readingTime={dictionary.web.content.readTime.replace(
                  "{minutes}",
                  String(getReadingTime(body))
                )}
              />
              <ProjectFacts
                copy={dictionary.web.content}
                locale={locale}
                project={project}
              />
            </div>
          }
          title={project.title ?? dictionary.web.content.untitled}
          variant="project"
        />
        {related.length ? (
          <section className="mt-10 flex flex-col gap-8 border-t pt-12">
            <h2 className="font-semibold text-2xl tracking-tight">
              {dictionary.web.content.moreProjects}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {related.map((item) => (
                <ProjectCard
                  copy={dictionary.web.content}
                  key={item._id}
                  locale={locale}
                  project={item}
                />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
};

export default function Page(properties: ProjectDetailProps) {
  return (
    <Suspense fallback={<ContentLoading variant="project" />}>
      <ProjectDetail {...properties} />
    </Suspense>
  );
}
