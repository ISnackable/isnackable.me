import { BlockContentIcon } from "@sanity/icons/BlockContent";
import { CogIcon } from "@sanity/icons/Cog";
import { DocumentIcon } from "@sanity/icons/Document";
import { SearchIcon } from "@sanity/icons/Search";
import { defineArrayMember, defineField, defineType } from "sanity";
import { pageLabels } from "../../content/pages";
import { validateModuleAnchors } from "../../modules/anchors";
import { articleModuleMembers } from "../../modules/schema";
import { i18nLocales } from "../../studio/localization";
import { hiddenAllFieldsGroup } from "../shared/editorial";
import { validatePageIdentity } from "../utils/page";

/** Pages share the document translation workflow used by posts and projects. */
export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  icon: DocumentIcon,
  groups: [
    {
      name: "content",
      title: "Page content",
      icon: BlockContentIcon,
      default: true,
    },
    { name: "seo", title: "SEO", icon: SearchIcon },
    { name: "settings", title: "Page details", icon: CogIcon },
    hiddenAllFieldsGroup,
  ],
  fields: [
    defineField({
      name: "route",
      title: "Page address",
      type: "string",
      group: "settings",
      description:
        "Set when the page is created and shared by its translations.",
      readOnly: true,
      options: {
        list: [
          { title: "Home ( / )", value: "home" },
          { title: "Blog ( /blog )", value: "blog" },
          { title: "Projects ( /projects )", value: "projects" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "language",
      type: "string",
      group: "settings",
      readOnly: true,
      hidden: true,
      options: {
        list: i18nLocales.map(({ id, title }) => ({ title, value: id })),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Page title",
      type: "string",
      group: "content",
      description: "Also used as the search title unless SEO overrides it.",
      hidden: ({ document }) => document?.route === "home",
      readOnly: ({ document }) => document?.route === "home",
      validation: (rule) =>
        rule.custom(
          (value, context) =>
            context.document?.route === "home" ||
            Boolean(value?.trim()) ||
            "Add a page title."
        ),
    }),
    defineField({
      name: "description",
      title: "Page description",
      type: "text",
      group: "content",
      rows: 3,
      description:
        "Also used as the search description unless SEO overrides it.",
      hidden: ({ document }) => document?.route === "home",
      readOnly: ({ document }) => document?.route === "home",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
    defineField({
      name: "sections",
      title: "Page builder",
      type: "array",
      group: "content",
      description:
        "Hero, About, Projects and Writing can appear once each. Other modules can repeat.",
      hidden: ({ document }) => document?.route !== "home",
      of: [
        defineArrayMember({ type: "heroSection" }),
        defineArrayMember({ type: "aboutSection" }),
        defineArrayMember({ type: "projectsSection" }),
        defineArrayMember({ type: "writingSection" }),
        ...articleModuleMembers,
      ],
      options: {
        layout: "list",
        modal: { type: "dialog", width: 3 },
        insertMenu: {
          showIcons: true,
          views: [{ name: "list" }, { name: "grid" }],
          groups: [
            {
              name: "sections",
              title: "Page sections",
              of: [
                "heroSection",
                "aboutSection",
                "projectsSection",
                "writingSection",
              ],
            },
            {
              name: "blocks",
              title: "Content blocks",
              of: articleModuleMembers.map(({ type }) => type),
            },
          ],
        },
      },
      validation: (rule) =>
        rule.max(30).custom((sections) => {
          const anchors = validateModuleAnchors(sections);
          if (anchors !== true) {
            return anchors;
          }
          const types =
            sections?.flatMap((section) =>
              section && typeof section === "object" && "_type" in section
                ? [section._type]
                : []
            ) ?? [];
          const fixed = types.filter((type) =>
            [
              "heroSection",
              "aboutSection",
              "projectsSection",
              "writingSection",
            ].includes(type as string)
          );
          return (
            new Set(fixed).size === fixed.length ||
            "Hero, About, Projects and Writing can appear only once each."
          );
        }),
    }),
  ],
  validation: (rule) =>
    rule.custom((_value, context) => validatePageIdentity(context)),
  preview: {
    select: { title: "title", language: "language", route: "route" },
    prepare({ title, language, route }) {
      return {
        title: route === "home" ? pageLabels.home : title || route,
        subtitle: `${language?.toUpperCase()} · /${route === "home" ? "" : route}`,
      };
    },
  },
});
