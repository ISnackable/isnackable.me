import { projects } from "@repo/cms";
import { SanityImage } from "@repo/cms/components/sanity-image";
import type { ProjectsSectionContent } from "@repo/cms/content/pages";
import { contentText } from "@repo/cms/content/text";
import type { Dictionary } from "@repo/internationalization";
import { ContentEmpty } from "../../components/content-empty";
import { SectionHeading } from "../../components/section-heading";
import { ArtifactPlaceholder } from "./artifact-placeholder";
import { ProjectExplorer } from "./project-explorer";

export async function ProjectsSection({
  dictionary,
  locale,
  section,
}: {
  section: ProjectsSectionContent;
  dictionary: Dictionary;
  locale: string;
}) {
  const items = await projects.getMeta(locale, section.limit ?? 3);
  const { content, home, header } = dictionary.web;
  return (
    <section className="flex flex-col gap-9">
      <SectionHeading
        action={{ href: `/${locale}/projects`, label: content.allProjects }}
        description={contentText(section.description)}
        label={header.projects}
        title={contentText(section.title) || header.projects}
      />
      {items.length ? (
        <ProjectExplorer
          copy={home.projects.exploration}
          exploreLabel={content.exploreProject}
          items={items.map((project, index) => ({
            id: project._id,
            href: `/${locale}/projects/${project.slug}`,
            title: project.title ?? content.untitled,
            summary: project.summary,
            role: project.role,
            technologies: project.technologies ?? [],
            isIllustrative: !project.coverImage?.asset,
            visual: project.coverImage?.asset ? (
              <SanityImage
                className="object-cover"
                fill
                image={project.coverImage}
                quality={60}
                sizes="(min-width: 768px) 560px, 100vw"
              />
            ) : (
              <ArtifactPlaceholder
                kind={index % 2 === 0 ? "workspace" : "timeline"}
              />
            ),
          }))}
        />
      ) : (
        <ContentEmpty
          description={content.projectsEmptyBody}
          title={content.projectsEmpty}
        />
      )}
    </section>
  );
}
