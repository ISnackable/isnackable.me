import { BlockContentIcon } from "@sanity/icons/BlockContent";
import { CalendarIcon } from "@sanity/icons/Calendar";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { SearchIcon } from "@sanity/icons/Search";
import { defineArrayMember, defineField, defineType } from "sanity";
import { defaultLocaleId, i18nLocales } from "../../studio/localization";
import { blockContentField } from "../objects/block-content";
import { hiddenAllFieldsGroup, imageAltField } from "../shared/editorial";
import { isUniqueSlug } from "../utils/slug";

export const post = defineType({
  name: "post",
  title: "Post",
  type: "document",
  icon: DocumentTextIcon,
  groups: [
    {
      name: "content",
      title: "Writing",
      icon: BlockContentIcon,
      default: true,
    },
    { name: "publishing", title: "Publishing", icon: CalendarIcon },
    { name: "seo", title: "SEO", icon: SearchIcon },
    hiddenAllFieldsGroup,
  ],
  fields: [
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      group: "publishing",
      readOnly: true,
      hidden: true,
      initialValue: defaultLocaleId,
      options: {
        list: i18nLocales.map((l) => ({ title: l.title, value: l.id })),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "publishing",
      description: "Keep unchanged after publishing to preserve links.",
      options: {
        source: "title",
        // Per-language uniqueness. Excludes both the draft and
        // published ids of the current document so an in-progress
        // draft never self-collides (the "slug always taken" bug).
        isUnique: isUniqueSlug,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      group: "publishing",
      description:
        "Short introduction in article cards and the default search description.",
      rows: 2,
      validation: (rule) => rule.max(200).warning("Keep it short for SEO"),
    }),
    defineField({
      name: "image",
      title: "Cover image",
      type: "image",
      group: "publishing",
      options: { collapsible: false, hotspot: true },
      fields: [
        {
          ...imageAltField,
          validation: (rule) =>
            rule
              .required()
              .warning("Describe the cover for readers who cannot see it."),
        },
      ],
    }),
    defineField({
      name: "date",
      title: "Published at",
      type: "datetime",
      group: "publishing",
      description:
        "Sets display date and sort order. Does not schedule publishing.",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "authors",
      title: "Authors",
      type: "array",
      group: "publishing",
      description: "Byline order. Reuse existing authors.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "author" }],
        }),
      ],
      validation: (rule) =>
        rule
          .min(1)
          .unique()
          .error("Add at least one author, without duplicates."),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "publishing",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "commentsEnabled",
      title: "Allow comments",
      type: "boolean",
      group: "publishing",
      initialValue: true,
      description:
        "Requires Giscus. Turning off keeps existing GitHub discussions.",
    }),
    // Inline the body field so the schema surface stays flat and
    // discoverable for content editors.
    defineField({ ...blockContentField, group: "content" }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  orderings: [
    {
      title: "Publish date, newest first",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "date",
      media: "image",
      language: "language",
    },
    prepare({ title, subtitle, media, language }) {
      return {
        title,
        subtitle: [language?.toUpperCase(), subtitle]
          .filter(Boolean)
          .join(" · "),
        media,
      };
    },
  },
});
