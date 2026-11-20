"use client";

import { Button } from "@repo/design-system/components/ui/button";
import type { Dictionary } from "@repo/internationalization";
import { ArrowUpRightIcon, ChevronRightIcon, LayersIcon } from "lucide-react";
import Link from "next/link";
import { type CSSProperties, type ReactNode, useId, useRef } from "react";
import { ContentTags } from "../../components/content-tags";
import { usePreviewSelection } from "../../components/use-preview-selection";

export interface ProjectPreviewItem {
  href: string;
  id: string;
  isIllustrative: boolean;
  role: string | null;
  summary: string | null;
  technologies: string[];
  title: string;
  visual: ReactNode;
}

export function ProjectExplorer({
  items,
  copy,
  exploreLabel,
}: {
  items: ProjectPreviewItem[];
  copy: Dictionary["web"]["home"]["projects"]["exploration"];
  exploreLabel: string;
}) {
  const previewId = useId();
  const previewRef = useRef<HTMLElement>(null);
  const { activeId, motion, select, hover } = usePreviewSelection(
    items[0]?.id ?? ""
  );
  const active = items.find((item) => item.id === activeId) ?? items[0];
  if (!active) {
    return null;
  }

  return (
    <div
      className="project-explorer"
      style={
        { "--preview-order": items.indexOf(active) * 2 + 1 } as CSSProperties
      }
    >
      <div className="project-directory">
        {items.map((item, index) => (
          <article
            className="project-option"
            data-active={item.id === active.id}
            key={item.id}
            style={{ "--project-order": index * 2 } as CSSProperties}
          >
            <div className="flex min-w-0 flex-col gap-3">
              <h3 className="text-balance font-medium text-xl leading-snug tracking-tight sm:text-2xl">
                <Button
                  aria-controls={previewId}
                  aria-pressed={item.id === active.id}
                  className="hover:text-primary hover:bg-transparent! project-option-button h-auto min-h-11 w-full justify-between gap-4 whitespace-normal p-0 text-left text-xl leading-snug has-data-[icon=inline-end]:pr-0 sm:text-2xl"
                  onClick={(event) => {
                    select(
                      item.id,
                      event.detail === 0 ? "keyboard" : "pointer"
                    );
                    if (
                      event.detail !== 0 &&
                      window.matchMedia("(width < 48rem)").matches
                    ) {
                      requestAnimationFrame(() =>
                        previewRef.current?.scrollIntoView({
                          block: "nearest",
                          behavior: "instant",
                        })
                      );
                    }
                  }}
                  onPointerEnter={() => {
                    if (window.matchMedia("(min-width: 48rem)").matches) {
                      hover(item.id);
                    }
                  }}
                  variant="ghost"
                >
                  <span>{item.title}</span>
                  <ChevronRightIcon
                    aria-hidden="true"
                    className="project-option-chevron"
                    data-icon="inline-end"
                  />
                </Button>
              </h3>
              {item.summary ? (
                <p className="line-clamp-2 text-muted-foreground text-sm leading-7">
                  {item.summary}
                </p>
              ) : null}
              {item.technologies.length ? (
                <ContentTags limit={3} values={item.technologies} />
              ) : null}
            </div>
          </article>
        ))}
      </div>
      <section
        aria-label={copy.previewLabel}
        className="project-preview"
        id={previewId}
        ref={previewRef}
      >
        <Link
          aria-label={`${exploreLabel}: ${active.title}`}
          className="project-preview-artifact content-link"
          href={active.href}
          prefetch={true}
        >
          <div className="artifact-toolbar">
            <span className="inline-flex items-center gap-2">
              <LayersIcon aria-hidden="true" className="size-4" />
              {copy.canvasLabel}
            </span>
            <span className="artifact-caption">
              {active.isIllustrative ? copy.placeholder : copy.media}
            </span>
          </div>
          <div
            className="artifact-stage preview-crossfade"
            data-motion={motion ? "pointer" : "instant"}
          >
            {items.map((item, index) => (
              <div
                aria-hidden={item.id !== active.id}
                className="preview-layer"
                data-active={item.id === active.id}
                data-tone={index % 2 === 0 ? "brand" : "teal"}
                key={item.id}
              >
                {item.visual}
              </div>
            ))}
          </div>
        </Link>
        <div className="project-preview-caption">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-muted-foreground text-xs">
              {active.role ?? copy.caption}
            </p>
            <p
              className="font-medium text-lg tracking-tight"
              data-preview-title
            >
              {active.title}
            </p>
          </div>
          <Link
            className="preview-open-link"
            href={active.href}
            prefetch={true}
          >
            {exploreLabel}
            <ArrowUpRightIcon aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
