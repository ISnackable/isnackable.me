import { InfoOutlineIcon } from "@sanity/icons/InfoOutline";
import { defineField } from "sanity";
import { defineModule } from "../define-module";

export const calloutModule = defineModule({
  name: "calloutModule",
  title: "Callout",
  type: "object",
  icon: InfoOutlineIcon,
  fields: [
    defineField({ name: "title", title: "Heading", type: "string" }),
    defineField({
      name: "tone",
      type: "string",
      initialValue: "note",
      options: {
        list: [
          { title: "Note", value: "note" },
          { title: "Tip", value: "tip" },
          { title: "Warning", value: "warning" },
        ],
      },
    }),
    defineField({
      name: "body",
      type: "moduleBody",
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "title", tone: "tone" },
    prepare: ({ title, tone }) => ({
      title: title || "Callout",
      subtitle: `Callout · ${tone || "note"}`,
    }),
  },
});
