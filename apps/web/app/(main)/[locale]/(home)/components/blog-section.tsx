import { blog } from "@repo/cms";
import type { WritingSectionContent } from "@repo/cms/content/pages";
import { contentText } from "@repo/cms/content/text";
import type { PortfolioDictionary } from "@repo/internationalization";
import { BlogCard } from "../../blog/components/blog-card";
import { ContentEmpty } from "../../components/content-empty";
import { SectionHeading } from "../../components/section-heading";

export async function BlogSection({
  dictionary,
  locale,
  section,
}: {
  section: WritingSectionContent;
  dictionary: PortfolioDictionary;
  locale: string;
}) {
  const posts = await blog.getLatestPosts(locale, section.limit ?? 3);
  const { blog: blogLabel } = dictionary.common.navigation;
  const { content } = dictionary.web;
  return (
    <section className="flex flex-col gap-9">
      <SectionHeading
        action={{ href: `/${locale}/blog`, label: content.allWriting }}
        description={contentText(section.description)}
        label={blogLabel}
        title={contentText(section.title) || blogLabel}
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
