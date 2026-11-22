import { pages, projects } from "@repo/cms";
import { contentText } from "@repo/cms/content/text";
import { getPortfolioDictionary, routing } from "@repo/internationalization";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getPortfolioLocale } from "@/i18n/locale";
import { createWebMetadata } from "@/lib/metadata";
import { ContentEmpty } from "../components/content-empty";
import ContentLoading from "../components/content-loading";
import { ProjectCard } from "./components/project-card";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const generateMetadata = async (): Promise<Metadata> =>
  createWebMetadata({ kind: "projects" }, await getPortfolioLocale());

const ProjectsIndex = async () => {
  const locale = await getPortfolioLocale();

  const dictionary = await getPortfolioDictionary(locale);
  const [items, document] = await Promise.all([
    projects.getMeta(locale, 50),
    pages.get("projects", locale),
  ]);

  return (
    <main className="portfolio-content site-shell content-page">
      <header className="page-heading">
        <p className="section-label">{dictionary.web.content.projectsLabel}</p>
        <h1>
          {contentText(document?.title) || dictionary.web.projects.meta.title}
        </h1>
        {contentText(document?.description) ? (
          <p className="page-description">{document?.description}</p>
        ) : null}
      </header>
      {items.length ? (
        <div className="flex flex-col gap-8">
          {items.map((project) => (
            <ProjectCard
              copy={dictionary.web.content}
              featured
              headingLevel={2}
              key={project._id}
              locale={locale}
              project={project}
            />
          ))}
        </div>
      ) : (
        <ContentEmpty
          description={dictionary.web.content.projectsEmptyBody}
          title={dictionary.web.content.projectsEmpty}
        />
      )}
    </main>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<ContentLoading variant="projects" />}>
      <ProjectsIndex />
    </Suspense>
  );
}
