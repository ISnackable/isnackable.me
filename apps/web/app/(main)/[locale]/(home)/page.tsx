import { pages, settings } from "@repo/cms";
import {
  getDefaultHomeSections,
  type HeroSectionContent,
  type PageSection,
} from "@repo/cms/content/pages";
import { resolveSiteSettings, type SiteSettings } from "@repo/cms/content/site";
import { contentText } from "@repo/cms/content/text";
import { ModuleFrame } from "@repo/cms/modules/frame";
import { VisualModuleView } from "@repo/cms/modules/renderer";
import { isVisualModule } from "@repo/cms/modules/types";
import {
  type Dictionary,
  getDictionary,
  routing,
} from "@repo/internationalization";
import type { Metadata } from "next";
import { type ReactNode, Suspense } from "react";
import { getSiteLocale } from "@/i18n/locale";
import { createWebMetadata } from "@/lib/metadata";
import { SectionReveal } from "../components/section-reveal";
import { AboutSection } from "./components/about-section";
import { BlogSection } from "./components/blog-section";
import { Hero } from "./components/hero";
import { HomeLoading, HomeSectionLoading } from "./components/home-loading";
import { ProjectsSection } from "./components/projects-section";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const generateMetadata = async (): Promise<Metadata> =>
  createWebMetadata({ kind: "home" }, await getSiteLocale());

export default async function Home() {
  const locale = await getSiteLocale();
  const dictionary = await getDictionary(locale);
  return (
    <main>
      <Suspense
        fallback={<HomeLoading label={dictionary.web.content.loading} />}
      >
        <HomeContent dictionary={dictionary} locale={locale} />
      </Suspense>
    </main>
  );
}

type SectionGroup =
  | { kind: "hero"; section: HeroSectionContent }
  | { kind: "content"; sections: PageSection[] };

/** Keep adjacent content inside the same shell while honoring the editorial order. */
function groupSections(sections: PageSection[]): SectionGroup[] {
  const groups: SectionGroup[] = [];
  for (const section of sections) {
    if (section._type === "heroSection") {
      groups.push({ kind: "hero", section });
      continue;
    }
    const last = groups.at(-1);
    if (last?.kind === "content") {
      last.sections.push(section);
    } else {
      groups.push({ kind: "content", sections: [section] });
    }
  }
  return groups;
}

async function HomeContent({
  dictionary,
  locale,
}: {
  dictionary: Dictionary;
  locale: string;
}) {
  const [page, siteDocument] = await Promise.all([
    pages.get("home", locale),
    settings.get(),
  ]);
  const site = resolveSiteSettings(siteDocument);
  const sections = page ? (page.sections ?? []) : getDefaultHomeSections();
  const hero = sections.find((section) => section._type === "heroSection");
  return (
    <>
      <h1 className="sr-only">
        {contentText(hero?.displayName) ||
          dictionary.web.home.hero.placeholderName}
      </h1>
      {groupSections(sections).map((group) =>
        group.kind === "hero" ? (
          <ModuleFrame
            attributes={group.section.attributes}
            key={group.section._key}
            moduleKey={group.section._key}
            type={group.section._type}
          >
            <Hero
              content={group.section}
              dictionary={dictionary}
              locale={locale}
              site={site}
            />
          </ModuleFrame>
        ) : (
          <div
            className="portfolio-content site-shell home-sections"
            key={group.sections[0]._key}
          >
            {group.sections.map((section) => (
              <SectionReveal key={section._key}>
                <Suspense
                  fallback={<HomeSectionLoading kind={section._type} />}
                >
                  <HomeSection
                    dictionary={dictionary}
                    locale={locale}
                    section={section}
                    site={site}
                  />
                </Suspense>
              </SectionReveal>
            ))}
          </div>
        )
      )}
    </>
  );
}

function HomeSection({
  section,
  dictionary,
  locale,
  site,
}: {
  section: PageSection;
  dictionary: Dictionary;
  locale: string;
  site: SiteSettings;
}) {
  if (isVisualModule(section)) {
    return <VisualModuleView module={section} />;
  }
  let content: ReactNode;
  switch (section._type) {
    case "aboutSection":
      content = (
        <AboutSection
          dictionary={dictionary}
          locale={locale}
          section={section}
          site={site}
        />
      );
      break;
    case "projectsSection":
      content = (
        <ProjectsSection
          dictionary={dictionary}
          locale={locale}
          section={section}
        />
      );
      break;
    case "writingSection":
      content = (
        <BlogSection
          dictionary={dictionary}
          locale={locale}
          section={section}
        />
      );
      break;
    default:
      return null;
  }
  return (
    <ModuleFrame
      attributes={section.attributes}
      moduleKey={section._key}
      type={section._type}
    >
      {content}
    </ModuleFrame>
  );
}
