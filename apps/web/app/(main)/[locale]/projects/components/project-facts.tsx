import type { PROJECT_QUERY_RESULT } from "@repo/cms";
import { Button } from "@repo/design-system/components/ui/button";
import type { PortfolioDictionary } from "@repo/internationalization";
import { stegaClean } from "@sanity/client/stega";
import { ArrowUpRightIcon, Code2Icon } from "lucide-react";
import { ContentTags } from "../../components/content-tags";

export function ProjectFacts({
  project,
  copy,
  locale,
}: {
  project: NonNullable<PROJECT_QUERY_RESULT>;
  copy: PortfolioDictionary["web"]["content"];
  locale: string;
}) {
  const formatDate = (value?: string | null) => {
    if (!value) {
      return null;
    }
    const date = new Date(`${stegaClean(value)}T00:00:00Z`);
    return Number.isNaN(date.getTime())
      ? null
      : new Intl.DateTimeFormat(locale, {
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }).format(date);
  };
  const start = formatDate(project.startDate);
  const end = formatDate(project.endDate);
  const status = project.status ? stegaClean(project.status) : null;
  const statusLabel =
    status === "inProgress" || status === "completed" || status === "archived"
      ? copy[status]
      : null;
  const period = start
    ? [start, end ?? (status === "inProgress" ? copy.present : null)]
        .filter(Boolean)
        .join(" — ")
    : end;
  const facts = [
    { label: copy.role, value: project.role },
    { label: copy.organization, value: project.organization },
    { label: copy.timeline, value: period },
    { label: copy.status, value: statusLabel },
  ].filter((fact) => fact.value);

  if (
    !(
      facts.length ||
      project.technologies?.length ||
      project.repositoryUrl ||
      project.liveUrl
    )
  ) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 pt-3">
      {facts.length ? (
        <dl className="project-facts">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {project.technologies?.length ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-muted-foreground text-sm">{copy.technologies}</p>
          <ContentTags values={project.technologies} />
        </div>
      ) : null}
      {project.repositoryUrl || project.liveUrl ? (
        <div className="flex flex-wrap gap-3">
          {project.repositoryUrl ? (
            <Button
              nativeButton={false}
              render={
                <a
                  href={stegaClean(project.repositoryUrl)}
                  rel="noopener noreferrer"
                  target="_blank"
                />
              }
              variant="outline"
            >
              <Code2Icon data-icon="inline-start" />
              {copy.source}
            </Button>
          ) : null}
          {project.liveUrl ? (
            <Button
              nativeButton={false}
              render={
                <a
                  href={stegaClean(project.liveUrl)}
                  rel="noopener noreferrer"
                  target="_blank"
                />
              }
            >
              {copy.demo}
              <ArrowUpRightIcon data-icon="inline-end" />
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
