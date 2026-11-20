import {
  PortableText,
  type PortableTextNode,
} from "@repo/cms/components/portable-text";
import {
  SanityImage,
  type SanityImageProps,
} from "@repo/cms/components/sanity-image";
import { cn } from "@repo/design-system/lib/utils";
import type { ReactNode } from "react";

export interface ArticleBodyProps {
  content: PortableTextNode[];
  description?: string | null;
  image?: SanityImageProps["image"] | null;
  metadata?: ReactNode;
  title: string;
  variant?: "article" | "project";
}

/** Shared reading typography with a wider introduction for project case studies. */
export function ArticleBody({
  content,
  description,
  image,
  metadata,
  title,
  variant = "article",
}: ArticleBodyProps) {
  const isProject = variant === "project";
  return (
    <article className="flex min-w-0 flex-col gap-8 sm:gap-10">
      <header
        className={cn(
          "flex min-w-0 flex-col gap-5 text-lg [overflow-wrap:anywhere]",
          !isProject && "article-measure"
        )}
      >
        <h1
          className={cn(
            "scroll-mt-24 text-balance font-semibold leading-tight tracking-tight",
            isProject
              ? "max-w-4xl text-4xl sm:text-5xl lg:text-6xl"
              : "text-3xl sm:text-4xl lg:text-5xl"
          )}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={cn(
              "text-pretty text-muted-foreground text-lg leading-relaxed sm:text-xl",
              isProject && "max-w-2xl"
            )}
          >
            {description}
          </p>
        ) : null}
        {metadata}
      </header>
      {image ? (
        <div
          className={cn(
            "relative aspect-[16/9] overflow-hidden bg-muted/40",
            isProject && "rounded-xl"
          )}
        >
          <SanityImage
            className="object-contain"
            fetchPriority="high"
            fill
            image={image}
            loading="eager"
            sizes={
              isProject
                ? "(min-width: 1152px) 1100px, 100vw"
                : "(min-width: 1024px) 832px, (min-width: 768px) 768px, 100vw"
            }
          />
        </div>
      ) : null}
      <div
        className="article-measure typeset typeset-article"
        data-article-body
      >
        <PortableText value={content} />
      </div>
    </article>
  );
}
