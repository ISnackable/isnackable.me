import type { ProjectMeta } from "@repo/cms";
import { Badge } from "@repo/design-system/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { cn } from "@repo/design-system/lib/utils";
import type { Dictionary } from "@repo/internationalization";
import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { ContentImage } from "../../components/content-image";
import { ContentTags } from "../../components/content-tags";

interface ProjectCardProps {
  copy: Dictionary["web"]["content"];
  featured?: boolean;
  headingLevel?: 2 | 3;
  locale: string;
  project: ProjectMeta;
}

export function ProjectCard({
  copy,
  featured = false,
  headingLevel = 3,
  locale,
  project,
}: ProjectCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <Link
      className="content-link project-link group"
      href={`/${locale}/projects/${project.slug}`}
      prefetch={true}
    >
      <Card
        className={cn(
          "h-full gap-0 p-0",
          featured && "project-showcase md:grid"
        )}
      >
        <div
          className={cn(
            "project-media",
            featured && "md:col-start-2 md:row-start-1"
          )}
        >
          <ContentImage
            image={project.coverImage}
            sizes="(min-width: 1152px) 530px, (min-width: 768px) 50vw, 100vw"
          />
        </div>
        <div className="project-copy">
          <CardHeader className="gap-4 p-0">
            {project.featured || project.organization ? (
              <div className="flex flex-wrap items-center gap-2">
                {project.featured ? (
                  <Badge variant="secondary">{copy.featured}</Badge>
                ) : null}
                {project.organization ? (
                  <span className="text-muted-foreground text-sm">
                    {project.organization}
                  </span>
                ) : null}
              </div>
            ) : null}
            <CardTitle>
              <Heading
                className={cn(
                  "text-balance font-medium text-2xl leading-tight tracking-tight",
                  featured && "lg:text-3xl"
                )}
              >
                {project.title ?? copy.untitled}
              </Heading>
            </CardTitle>
            {project.summary ? (
              <CardDescription>
                <p className="max-w-lg text-base leading-7">
                  {project.summary}
                </p>
              </CardDescription>
            ) : null}
          </CardHeader>
          {project.technologies?.length ? (
            <CardContent className="p-0">
              <ContentTags
                limit={5}
                values={project.technologies}
                variant="outline"
              />
            </CardContent>
          ) : null}
          <CardFooter className="mt-auto justify-between gap-3 border-t px-0 pt-5">
            <span className="text-muted-foreground">
              {project.role ?? copy.projectDetails}
            </span>
            <span className="inline-flex items-center gap-2 font-medium text-primary">
              {copy.exploreProject}
              <ArrowUpRightIcon
                aria-hidden="true"
                className="project-link-arrow size-4"
              />
            </span>
          </CardFooter>
        </div>
      </Card>
    </Link>
  );
}
