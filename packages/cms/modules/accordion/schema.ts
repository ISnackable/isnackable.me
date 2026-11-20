import { ChevronDownIcon } from "@sanity/icons/ChevronDown";
import { defineArrayMember, defineField } from "sanity";
import { defineModule } from "../define-module";

export const accordionModule = defineModule({
  name: "accordionModule",
  title: "Accordion",
  type: "object",
  icon: ChevronDownIcon,
  fields: [
    defineField({ name: "title", title: "Heading", type: "string" }),
    defineField({
      name: "items",
      type: "array",
      validation: (rule) => rule.required().min(1).max(24),
      of: [
        defineArrayMember({
          name: "accordionItem",
          type: "object",
          options: { collapsible: false },
          fields: [
            defineField({
              name: "title",
              title: "Summary",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "body", type: "moduleBody" }),
            defineField({
              name: "open",
              title: "Initially expanded",
              type: "boolean",
              initialValue: false,
            }),
          ],
          preview: { select: { title: "title" } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title", items: "items" },
    prepare: ({ title, items }) => ({
      title: title || "Accordion",
      subtitle: `${items?.length ?? 0} items`,
    }),
  },
});
