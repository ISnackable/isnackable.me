import { BlockContentIcon } from "@sanity/icons/BlockContent";
import { CodeIcon } from "@sanity/icons/Code";
import { ControlsIcon } from "@sanity/icons/Controls";
import { SearchIcon } from "@sanity/icons/Search";
import { defineArrayMember, defineField, defineType } from "sanity";
import { defaultLocaleId, i18nLocales } from "../../studio/localization";
import { blockContentField } from "../objects/block-content";
import { hiddenAllFieldsGroup, imageAltField } from "../shared/editorial";
import { isUniqueSlug } from "../utils/slug";

/**
 * Project content type. Uses document-level internationalization — one project
 * document per locale, linked via `translation.metadata` by the
 * `@sanity/document-internationalization` plugin (same pattern as `post`).
 *
 * Featured projects are surfaced on the homepage; every project has a
 * detail page at `/:locale/projects/:slug` rendering its `content` body.
 */

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  icon: CodeIcon,
  groups: [
    {
      name: "content",
      title: "Content",
      icon: BlockContentIcon,
      default: true,
    },
    { name: "details", title: "Project details", icon: CodeIcon },
    { name: "publishing", title: "Publishing", icon: ControlsIcon },
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
        // Per-language uniqueness (same safeguard as `post`).
        isUnique: isUniqueSlug,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      group: "content",
      rows: 2,
      description:
        "Shown in project cards and previews; also the default search description.",
      validation: (rule) => rule.max(200).warning("Keep it short for cards"),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      group: "content",
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
      name: "role",
      type: "string",
      group: "details",
    }),
    defineField({
      name: "organization",
      type: "string",
      group: "details",
    }),
    defineField({
      name: "technologies",
      type: "array",
      group: "details",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "status",
      type: "string",
      group: "details",
      options: {
        list: [
          { title: "In progress", value: "inProgress" },
          { title: "Completed", value: "completed" },
          { title: "Archived", value: "archived" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "startDate",
      type: "date",
      group: "details",
    }),
    defineField({
      name: "endDate",
      type: "date",
      group: "details",
      description: "Leave empty for ongoing work.",
      validation: (rule) =>
        rule.custom((endDate, context) => {
          const startDate = context.document?.startDate;
          return (
            !(
              typeof startDate === "string" &&
              endDate &&
              endDate < startDate
            ) || "End date must be on or after the start date."
          );
        }),
    }),
    defineField({
      name: "repositoryUrl",
      title: "Source repository",
      type: "url",
      group: "details",
      description: "Leave empty for private source.",
      validation: (rule) => rule.uri({ scheme: ["https", "http"] }),
    }),
    defineField({
      name: "liveUrl",
      title: "Live project URL",
      type: "url",
      group: "details",
      validation: (rule) => rule.uri({ scheme: ["https", "http"] }),
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      group: "publishing",
      description:
        "Shown first on the homepage. Other projects fill any remaining places.",
      initialValue: false,
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
    // Inline the body field so the schema surface stays flat and
    // discoverable for content editors (same pattern as `post`).
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
      media: "coverImage",
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
