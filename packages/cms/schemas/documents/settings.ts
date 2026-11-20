import { CogIcon } from "@sanity/icons/Cog";
import { LinkIcon } from "@sanity/icons/Link";
import { SearchIcon } from "@sanity/icons/Search";
import { UserIcon } from "@sanity/icons/User";
import { defineField, defineType } from "sanity";
import { hiddenAllFieldsGroup } from "../shared/editorial";

const TWITTER_HANDLE = /^@[A-Za-z0-9_]{1,15}$/;
const GITHUB_PROFILE_URL = /^https:\/\/github\.com\/[A-Za-z0-9-]+\/?$/;

/**
 * Site-wide settings. Singleton — enforced by Studio Structure with a fixed
 * document ID (`settings`). See `packages/cms/studio/structure.ts`.
 */
export const settings = defineType({
  name: "settings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "identity", title: "Site identity", icon: UserIcon, default: true },
    { name: "social", title: "Links & accounts", icon: LinkIcon },
    { name: "sharing", title: "SEO", icon: SearchIcon },
    hiddenAllFieldsGroup,
  ],
  fields: [
    defineField({
      name: "title",
      title: "Site title",
      type: "string",
      group: "identity",
      description:
        "Website name in the header, footer and default page metadata.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Site description",
      type: "text",
      group: "sharing",
      description: "Used when a page has no description.",
      rows: 2,
    }),
    defineField({
      name: "ogImage",
      title: "Homepage social image",
      type: "image",
      group: "sharing",
      description:
        "1200×630 recommended. Applies to the homepage only. Leave empty to generate a card from site settings.",
      options: { hotspot: true },
    }),
    defineField({
      name: "authorName",
      title: "Author name",
      type: "string",
      group: "identity",
      description:
        "Used in page metadata. Edit the homepage name in Hero scene.",
    }),
    defineField({
      name: "authorUrl",
      title: "Author website",
      type: "url",
      group: "identity",
      description: "HTTPS URL for author attribution.",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "publisher",
      title: "Copyright holder",
      type: "string",
      group: "identity",
      description:
        "Shown in the footer. Search metadata uses Site title when empty.",
    }),
    defineField({
      name: "twitterHandle",
      title: "X / Twitter handle",
      type: "string",
      group: "social",
      description: "Include @. Used in sharing metadata.",
      validation: (rule) =>
        rule
          .regex(TWITTER_HANDLE)
          .warning("Use @ followed by the account handle."),
    }),
    defineField({
      name: "githubUrl",
      title: "GitHub profile",
      type: "url",
      group: "social",
      description:
        "Also used for the homepage link and contributions. Leave empty to hide both.",
      validation: (rule) =>
        rule
          .uri({ scheme: ["https"] })
          .custom(
            (value) =>
              !value ||
              GITHUB_PROFILE_URL.test(value) ||
              "Use a GitHub profile URL without extra paths or query parameters."
          ),
    }),
    defineField({
      name: "linkedinUrl",
      title: "LinkedIn profile",
      type: "url",
      group: "social",
      description: "Full public profile URL shown in the footer.",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
  },
});
