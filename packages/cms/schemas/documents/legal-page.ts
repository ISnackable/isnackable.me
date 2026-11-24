import { BlockContentIcon } from "@sanity/icons/BlockContent";
import { DocumentIcon } from "@sanity/icons/Document";
import { SearchIcon } from "@sanity/icons/Search";
import { defineField, defineType } from "sanity";
import { defaultLocaleId, i18nLocales } from "../../studio/localization";
import { blockContentField } from "../objects/block-content";
import { hiddenAllFieldsGroup } from "../shared/editorial";
import { isUniqueSlug } from "../utils/slug";

export const legalPage = defineType({
  name: "legalPage",
  title: "Legal page",
  type: "document",
  icon: DocumentIcon,
  groups: [
    {
      name: "content",
      title: "Content",
      icon: BlockContentIcon,
      default: true,
    },
    { name: "seo", title: "SEO", icon: SearchIcon },
    hiddenAllFieldsGroup,
  ],
  fields: [
    defineField({
      name: "language",
      type: "string",
      group: "content",
      readOnly: true,
      hidden: true,
      initialValue: defaultLocaleId,
      options: {
        list: i18nLocales.map((locale) => ({
          title: locale.title,
          value: locale.id,
        })),
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
      group: "content",
      description: "Appears after /legal/. Keep unchanged after publishing.",
      options: { source: "title", isUnique: isUniqueSlug },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      group: "content",
      rows: 2,
      description:
        "Short introduction below the heading, also used as the default search description.",
      validation: (rule) => rule.max(200).warning("Keep it short for SEO"),
    }),
    defineField({ ...blockContentField, group: "content" }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
  },
});
