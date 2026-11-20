interface ArticleMetaProps {
  author?: string | null;
  date?: string | null;
  locale: string;
  readingTime?: string;
}

export function ArticleMeta({
  author,
  date,
  locale,
  readingTime,
}: ArticleMetaProps) {
  const publishedAt = date ? new Date(date) : null;
  const hasDate = publishedAt && !Number.isNaN(publishedAt.getTime());

  return (
    <ul
      className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-sm leading-6"
      data-article-meta
    >
      {author ? <li>{author}</li> : null}
      {hasDate ? (
        <li>
          <time dateTime={publishedAt.toISOString()}>
            {new Intl.DateTimeFormat(locale, {
              dateStyle: "medium",
              timeZone: "UTC",
            }).format(publishedAt)}
          </time>
        </li>
      ) : null}
      {readingTime ? <li>{readingTime}</li> : null}
    </ul>
  );
}
