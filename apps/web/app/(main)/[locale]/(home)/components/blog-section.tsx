import { blog } from "@repo/cms";
import type { WritingSectionContent } from "@repo/cms/content/pages";
import { contentText } from "@repo/cms/content/text";
import type { Dictionary } from "@repo/internationalization";
import { BlogCard } from "../../blog/components/blog-card";
import { ContentEmpty } from "../../components/content-empty";
import { SectionHeading } from "../../components/section-heading";

export async function BlogSection({
  dictionary,
  locale,
  section,
}: {
  section: WritingSectionContent;
  dictionary: Dictionary;
  locale: string;
}) {
  const posts = await blog.getLatestPosts(locale, section.limit ?? 3);
  const { content, header } = dictionary.web;
  return (
    <section className="flex flex-col gap-9">
      <SectionHeading
        action={{ href: `/${locale}/blog`, label: content.allWriting }}
        description={contentText(section.description)}
        label={header.blog}
        title={contentText(section.title) || header.blog}
      />
      {posts.length ? (
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <BlogCard
              copy={content}
              key={post._id}
              locale={locale}
              post={post}
            />
          ))}
        </div>
      ) : (
        <ContentEmpty
          description={content.writingEmptyBody}
          title={content.writingEmpty}
        />
      )}
    </section>
  );
}
