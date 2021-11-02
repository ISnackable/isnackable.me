import { FaBloggerB } from "react-icons/fa";

export default {
  name: "post",
  title: "Blog Post",
  type: "document",
  icon: FaBloggerB,
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      description: "Titles should be catchy, descriptive, and not too long",
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
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
      description:
        "Description should be descriptive on what the blog post is about",
    },
    {
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      description: "This can be used to schedule post for publishing",
    },
    {
      name: "author",
      title: "Author",
      type: "reference",
      to: { type: "author" },
    },
    {
      name: "mainImage",
      title: "Main image",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: { type: "category" } }],
    },
    {
      name: "body",
      title: "Body",
      type: "blockContent",
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
      author: "author.name",
      media: "mainImage",
    },
    prepare(selection) {
      const { author } = selection;
      return Object.assign({}, selection, {
        subtitle: author && `by ${author}`,
      });
    },
  },
};
