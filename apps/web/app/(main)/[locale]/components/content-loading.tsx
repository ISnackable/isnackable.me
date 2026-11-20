"use client";

import { Skeleton } from "@repo/design-system/components/ui/skeleton";
import { useTranslations } from "@repo/internationalization/client";
import type { ReactNode } from "react";

function TextLines() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  );
}

function PageHeading() {
  return (
    <div className="page-heading">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-11 w-64 max-w-full sm:h-15" />
      <Skeleton className="h-5 w-full max-w-lg" />
    </div>
  );
}

function BlogCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((index) => (
        <div className="flex min-w-0 flex-col gap-4" key={index}>
          <Skeleton className="aspect-[16/10] w-full" />
          <Skeleton className="mt-1 h-4 w-40" />
          <Skeleton className="h-7 w-4/5" />
          <TextLines />
        </div>
      ))}
    </div>
  );
}

function BlogResultsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid items-end gap-4 md:grid-cols-[minmax(0,1fr)_minmax(10rem,14rem)_auto]">
        <div className="flex min-w-0 flex-col gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-11 w-full" />
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-11 w-full" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-11 w-20" />
          <Skeleton className="h-11 w-28" />
        </div>
      </div>
      <Skeleton className="h-4 w-24" />
      <BlogCards />
    </div>
  );
}

export function BlogResultsLoading() {
  const t = useTranslations("web.content");
  return (
    <div
      aria-label={t("loading")}
      className="motion-reduce:[&_[data-slot=skeleton]]:animate-none"
      role="status"
    >
      <div aria-hidden="true">
        <BlogResultsSkeleton />
      </div>
    </div>
  );
}

function ProjectCards() {
  return (
    <div className="flex flex-col gap-8">
      {[0, 1].map((index) => (
        <div
          className="project-showcase overflow-hidden rounded-xl border md:grid"
          key={index}
        >
          <Skeleton className="aspect-[16/10] w-full rounded-none md:col-start-2 md:row-start-1 md:aspect-auto md:min-h-76" />
          <div className="project-copy">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-4/5" />
            <TextLines />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-auto h-5 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Article({ project = false }: { project?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-8">
      <Skeleton className="h-6 w-36" />
      <div className="flex flex-col gap-5">
        <Skeleton
          className={project ? "h-12 w-4/5 sm:h-15" : "h-10 w-4/5 sm:h-12"}
        />
        <Skeleton className="h-6 w-full max-w-2xl" />
        <Skeleton className="h-4 w-56 max-w-full" />
        {project ? <Skeleton className="mt-2 h-20 w-full" /> : null}
      </div>
      <Skeleton className="aspect-video w-full" />
      <div className="article-measure flex w-full flex-col gap-8 text-lg">
        <TextLines />
        <TextLines />
      </div>
    </div>
  );
}

/** Match each route's shell, columns and media instead of a generic card grid. */
export default function ContentLoading({
  variant = "article",
}: {
  variant?: "blog" | "projects" | "article" | "project" | "legal";
}) {
  const t = useTranslations("web.content");
  let content: ReactNode;
  let className = "portfolio-content site-shell content-page";
  switch (variant) {
    case "blog":
      content = (
        <>
          <PageHeading />
          <BlogResultsSkeleton />
        </>
      );
      break;
    case "projects":
      content = (
        <>
          <PageHeading />
          <ProjectCards />
        </>
      );
      break;
    case "project":
      content = <Article project />;
      break;
    case "legal":
      className =
        "mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-16 md:px-6";
      content = (
        <>
          <Skeleton className="h-12 w-64 max-w-full" />
          <Skeleton className="h-5 w-full max-w-lg" />
          <div className="article-measure mt-10 flex flex-col gap-8 text-lg">
            <TextLines />
            <TextLines />
          </div>
        </>
      );
      break;
    default:
      className =
        "portfolio-content mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14";
      content = (
        <div className="grid min-w-0 grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_14rem]">
          <Article />
          <div className="hidden flex-col gap-5 lg:flex">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-44" />
          </div>
        </div>
      );
  }
  return (
    <main className={className} data-loading-layout={variant}>
      <div
        aria-label={t("loading")}
        className="contents motion-reduce:[&_[data-slot=skeleton]]:animate-none"
        role="status"
      >
        <div aria-hidden="true" className="contents">
          {content}
        </div>
      </div>
    </main>
  );
}
