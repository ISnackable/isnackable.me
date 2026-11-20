import { defineField, defineType } from "sanity";

const anchorPattern = /^[A-Za-z][A-Za-z0-9_-]*$/;

export const moduleAttributes = defineType({
  name: "moduleAttributes",
  title: "Visibility & links",
  type: "object",
  options: { collapsible: false },
  fieldsets: [
    {
      name: "link",
      title: "Link to this block",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: "hidden",
      title: "Hide from page",
      type: "boolean",
      initialValue: false,
      description: "Keeps the content in Studio.",
    }),
    defineField({
      name: "uid",
      title: "Link anchor",
      type: "string",
      fieldset: "link",
      description: "For example, setup-notes creates #setup-notes.",
      validation: (rule) =>
        rule
          .regex(anchorPattern)
          .error(
            "Start with a letter, then use letters, numbers, underscores or hyphens."
          ),
    }),
  ],
});
