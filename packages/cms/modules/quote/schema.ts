import { BlockquoteIcon } from "@sanity/icons/Blockquote";
import { defineField } from "sanity";
import { defineModule } from "../define-module";

export const quoteModule = defineModule({
  name: "quoteModule",
  title: "Attributed quote",
  description:
    "A quotation with structured attribution or a source link. For an ordinary quotation in an article, use the Quote text style in the writing toolbar.",
  type: "object",
  icon: BlockquoteIcon,
  fields: [
    defineField({
      name: "quote",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "attribution",
      type: "string",
      description: "Person or source to credit.",
    }),
    defineField({ name: "sourceLabel", title: "Source title", type: "string" }),
    defineField({
      name: "sourceUrl",
      title: "Source URL",
      type: "url",
      validation: (rule) => rule.uri({ scheme: ["https", "http"] }),
    }),
  ],
  preview: {
    select: { title: "quote", subtitle: "attribution" },
    prepare: ({ title, subtitle }) => ({
      title: title || "Attributed quote",
      subtitle: subtitle || "Attributed quote · author or source",
    }),
  },
});
