import { ImageIcon } from "@sanity/icons/Image";
import { LinkIcon } from "@sanity/icons/Link";
import { defineArrayMember, defineField, defineType } from "sanity";
import {
  articleReservedIds,
  validateModuleAnchors,
} from "../../modules/anchors";
import { articleModuleMembers } from "../../modules/schema";
import { imageAltField } from "../shared/editorial";

/**
 * Reusable block content field definition. Import and spread into a document field:
 *
 * ```ts
 * defineField({ ...blockContentField, name: "content", title: "Content" })
 * ```
 *
 * The array includes standard text blocks plus custom `code` and `image`
 * members with appropriate marks and annotations.
 */
export const blockContentField = defineField({
  name: "content",
  title: "Content",
  type: "array",
  description:
    "Use the Quote text style for ordinary quotations. Insert modules for callouts, galleries, attributed quotes and expandable content.",
  validation: (rule) =>
    rule.custom((value) => validateModuleAnchors(value, articleReservedIds)),
  of: [
    ...articleModuleMembers,
    defineArrayMember({
      type: "block",
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
          { title: "Underline", value: "underline" },
          { title: "Strikethrough", value: "strike-through" },
          { title: "Code", value: "code" },
          { title: "Highlight", value: "highlight" },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Link",
            icon: LinkIcon,
            fields: [
              defineField({
                name: "href",
                title: "URL",
                type: "url",
                description: "Web address, site-relative path or mailto: link.",
                validation: (rule) =>
                  rule.uri({
                    allowRelative: true,
                    scheme: ["http", "https", "mailto"],
                  }),
              }),
              defineField({
                name: "openInNewTab",
                title: "Open in new tab",
                type: "boolean",
                initialValue: false,
              }),
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: "code",
      title: "Code",
    }),
    defineArrayMember({
      type: "image",
      title: "Image",
      icon: ImageIcon,
      options: { hotspot: true },
      fields: [
        imageAltField,
        defineField({
          name: "caption",
          title: "Caption",
          type: "string",
        }),
      ],
    }),
  ],
});

// Keep a `blockContent` export for the schema index (so the type shows up in Studio).
export const blockContent = defineType({
  name: "blockContent",
  title: "Block Content",
  type: "array",
  of: blockContentField.of,
});
