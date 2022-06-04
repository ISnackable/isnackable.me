/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
export default {
  name: "post",
  title: "Blog",
  type: "document",
  groups: [
    {
      name: "seo",
      title: "SEO",
    },
    {
      name: "content",
      title: "Content",
    },
  ],
  initialValue: () => ({
    publishedAt: new Date().toISOString(),
    author: {
      _ref: "4a55f40a-2011-4ee8-8bab-45bac88f88df",
      _type: "reference",
    },
  }),
  fields: [
    { name: "seoTitle", title: "SEO title", type: "string", group: "seo" },
    { name: "seoKeywords", title: "Keywords", type: "string", group: "seo" },
    { name: "seoSlug", title: "Slug", type: "slug", group: "seo" },
    { name: "seoImage", title: "Image", type: "image", group: "seo" },
    {
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      description: "Titles should be catchy, descriptive, and not too long",
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      description:
        "Some frontends will require a slug to be set to be able to show the post",
      options: {
        source: "title",
        maxLength: 96,
      },
    },
    {
      name: "description",
      title: "Description",
      type: "text",
      group: "content",
      description:
        "Description should be descriptive on what the blog post is about",
    },
    {
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      group: "content",
      description: "This can be used to schedule post for publishing",
    },
    {
      name: "author",
      title: "Author",
      type: "reference",
      group: "content",
      to: { type: "author" },
    },
    {
      name: "mainImage",
      title: "Main Image",
      type: "mainImage",
      group: "content",
    },
    {
      name: "categories",
      title: "Categories",
      type: "array",
      group: "content",
      of: [{ type: "reference", to: { type: "category" } }],
    },
    {
      name: "tags",
      title: "Tags",
      type: "tags",
      group: "content",
      options: {
        includeFromReference: "category",
      },
    },
    {
      name: "body",
      title: "Body",
      type: "blockContent",
      group: "content",
    },
  ],
  orderings: [
    {
      name: "publishingDateAsc",
      title: "Publishing date new -> old",
      by: [
        {
          field: "publishedAt",
          direction: "asc",
        },
        {
          field: "title",
          direction: "asc",
        },
      ],
    },
    {
      name: "publishingDateDesc",
      title: "Publishing date old -> new",
      by: [
        {
          field: "publishedAt",
          direction: "desc",
        },
        {
          field: "title",
          direction: "asc",
        },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      publishedAt: "publishedAt",
      slug: "slug",
      media: "mainImage",
    },
    prepare({
      title = "No title",
      publishedAt,
      slug,
      media,
    }: {
      title: string;
      publishedAt: string;
      slug: { current: string };
      media: any;
    }) {
      const path = `/blog/${slug?.current}`;
      return {
        title,
        media,
        subtitle: publishedAt ? path : "Missing publishing date",
      };
    },
  },
};
