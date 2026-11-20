import type { PostMeta } from "@repo/cms";
import type { Dictionary } from "@repo/internationalization";
import Link from "next/link";
import { ArticleMeta } from "../../components/article-meta";
import { ContentImage } from "../../components/content-image";
import { ContentTags } from "../../components/content-tags";

interface BlogCardProps {
  copy: Dictionary["web"]["content"];
  headingLevel?: 2 | 3;
  locale: string;
  post: PostMeta;
}

export function BlogCard({
  copy,
  headingLevel = 3,
  locale,
  post,
}: BlogCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const readingTime =
    post.estimatedReadingTime === null
      ? undefined
      : copy.readTime.replace(
          "{minutes}",
          String(Math.max(1, post.estimatedReadingTime))
        );
  return (
    <Link
      className="content-link writing-link group"
      href={`/${locale}/blog/${post.slug}`}
      prefetch={true}
    >
      <article className="writing-card">
        <ContentImage
          image={post.image}
          sizes="(min-width: 1152px) 350px, (min-width: 768px) 33vw, 100vw"
        />
        <div className="flex flex-1 flex-col gap-4 pt-5">
          <ArticleMeta
            date={post.date}
            locale={locale}
            readingTime={readingTime}
          />
          <Heading className="text-balance font-medium text-xl leading-snug tracking-tight">
            {post.title ?? copy.untitled}
          </Heading>
          {post.description ? (
            <p className="line-clamp-3 text-muted-foreground text-sm leading-7">
              {post.description}
            </p>
          ) : null}
          {post.tags?.length ? (
            <div className="mt-auto pt-1">
              <ContentTags limit={3} values={post.tags} />
            </div>
          ) : null}
        </div>
      </article>
    </Link>
  );
}
