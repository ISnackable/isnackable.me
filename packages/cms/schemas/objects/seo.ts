import { SearchIcon } from "@sanity/icons/Search";
import { defineField, defineType } from "sanity";

/**
 * Search metadata and social image overrides for published content.
 */
export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  icon: SearchIcon,
  options: { collapsible: false },
  fieldsets: [
    { name: "metadata", title: "Search appearance" },
    { name: "sharing", title: "Social sharing" },
    {
      name: "indexing",
      title: "Search visibility",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      fieldset: "metadata",
      description:
        "Leave empty to use the page title, or Home for the homepage. Does not change visible headings.",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      fieldset: "metadata",
      description:
        "Leave empty to use the page description, then the site default.",
      rows: 3,
    }),
    defineField({
      name: "image",
      title: "Image",
      fieldset: "sharing",
      description:
        "1200×630 recommended. Leave empty to generate a card for this page. The homepage can also use the image from Site Settings.",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "noIndex",
      title: "Hide from search engines",
      type: "boolean",
      fieldset: "indexing",
      description:
        "The published URL stays accessible to anyone with the link.",
      initialValue: false,
    }),
  ],
});
