import { UserIcon } from "@sanity/icons/User";
import { defineField, defineType } from "sanity";
import { imageAltField } from "../shared/editorial";

export const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "Used in article bylines.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "avatar",
      title: "Avatar",
      type: "image",
      description: "Portrait shown beside article bylines.",
      options: { collapsible: false, hotspot: true },
      fields: [imageAltField],
    }),
    defineField({
      name: "xUrl",
      title: "X (Twitter) URL",
      type: "url",
      description: "Full profile URL.",
      validation: (rule) =>
        rule.uri({
          scheme: ["https"],
        }),
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "avatar",
    },
  },
});
