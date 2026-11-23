import { BlockContentIcon } from "@sanity/icons/BlockContent";
import { DocumentIcon } from "@sanity/icons/Document";
import { SearchIcon } from "@sanity/icons/Search";
import { defineField, defineType } from "sanity";
import { i18nLocales } from "../../studio/localization";
import { blockContentField } from "../objects/block-content";
import { hiddenAllFieldsGroup } from "../shared/editorial";

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
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      description: "Shared across all website languages.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "navigationLabel",
      type: "internationalizedArrayString",
      group: "content",
      description:
        "Short link text for the site footer. Enter a label in every language before publishing.",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      description: "Appears after /legal/. Keep unchanged after publishing.",
      options: { source: "title" },
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
  // Keep the localized array's own validation for duplicate and invalid languages.
  validation: (rule) =>
    rule.custom((document) => {
      const labels = Array.isArray(document?.navigationLabel)
        ? document.navigationLabel
        : [];
      const missingLanguages = i18nLocales.filter(
        ({ id }) =>
          !labels.some(
            (label) =>
              label?.language === id &&
              typeof label.value === "string" &&
              label.value.trim().length > 0
          )
      );

      return missingLanguages.length
        ? {
            message: `Enter a navigation label for ${missingLanguages.map(({ title }) => title).join(", ")}.`,
            path: ["navigationLabel"],
          }
        : true;
    }),
  preview: {
    select: {
      title: "title",
    },
  },
});
