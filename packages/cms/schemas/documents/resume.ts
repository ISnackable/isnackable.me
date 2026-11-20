import { BookIcon } from "@sanity/icons/Book";
import { CodeIcon } from "@sanity/icons/Code";
import { ControlsIcon } from "@sanity/icons/Controls";
import { DocumentPdfIcon } from "@sanity/icons/DocumentPdf";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { TagIcon } from "@sanity/icons/Tag";
import { UserIcon } from "@sanity/icons/User";
import { defineArrayMember, defineField, defineType } from "sanity";
import { defaultLocaleId, i18nLocales } from "../../studio/localization";
import {
  collectionEditorOptions,
  hiddenAllFieldsGroup,
} from "../shared/editorial";

/**
 * Resume content type. Uses document-level internationalization — one resume
 * document per locale, linked via `translation.metadata` by the
 * `@sanity/document-internationalization` plugin.
 *
 * The Brilliant CV Typst project is generated at compile time
 * by the resume route's `generateTypstProject` from this content.
 */
const sectionOptions = [
  { title: "Education", value: "education" },
  { title: "Professional experience", value: "professional" },
  { title: "Projects", value: "projects" },
  { title: "Certificates", value: "certificates" },
  { title: "Publications", value: "publications" },
  { title: "Skills", value: "skills" },
];

const entryFields = [
  defineField({
    name: "title",
    title: "Title",
    type: "string",
    validation: (rule) => rule.required(),
  }),
  defineField({ name: "society", title: "Organization", type: "string" }),
  defineField({
    name: "date",
    title: "Date or date range",
    type: "string",
    description: "For example, 2024–Present or Sep 2021–Jun 2024.",
  }),
  defineField({ name: "location", title: "Location", type: "string" }),
  defineField({ name: "url", title: "URL", type: "url" }),
  defineField({
    name: "logo",
    title: "Logo",
    type: "image",
    options: { hotspot: true },
    fields: [
      defineField({ name: "alt", title: "Alternative text", type: "string" }),
    ],
  }),
  defineField({
    name: "description",
    title: "Description bullets",
    type: "array",
    description: "One bullet per entry. Omit Markdown markers.",
    options: { collapseItemsAfter: 3 },
    of: [defineArrayMember({ type: "text", rows: 2 })],
  }),
  defineField({
    name: "tags",
    title: "Tags",
    type: "array",
    options: { layout: "tags" },
    of: [defineArrayMember({ type: "string" })],
  }),
];

const roleFields = [
  defineField({
    name: "title",
    title: "Role title",
    type: "string",
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: "date",
    title: "Date or date range",
    type: "string",
  }),
  defineField({ name: "url", title: "URL", type: "url" }),
  defineField({
    name: "description",
    title: "Description bullets",
    type: "array",
    options: { collapseItemsAfter: 3 },
    description: "One bullet per entry. Omit Markdown markers.",
    of: [defineArrayMember({ type: "text", rows: 2 })],
  }),
  defineField({
    name: "tags",
    title: "Tags",
    type: "array",
    options: { layout: "tags" },
    of: [defineArrayMember({ type: "string" })],
  }),
];

const experienceFields = [
  ...entryFields,
  defineField({
    name: "roles",
    title: "Grouped roles",
    description: "Use for multiple positions at one employer.",
    type: "array",
    options: collectionEditorOptions,
    of: [
      defineArrayMember({
        type: "object",
        icon: UserIcon,
        options: { collapsible: false },
        fields: roleFields,
        preview: {
          select: { title: "title", date: "date" },
          prepare({ title, date }: { title?: string; date?: string }) {
            return { title, subtitle: date };
          },
        },
      }),
    ],
  }),
];

const honorFields = [
  defineField({
    name: "title",
    title: "Title",
    type: "string",
    validation: (rule) => rule.required(),
  }),
  defineField({ name: "issuer", title: "Issuer", type: "string" }),
  defineField({
    name: "date",
    title: "Date or date range",
    type: "string",
  }),
  defineField({ name: "location", title: "Location", type: "string" }),
  defineField({ name: "url", title: "URL", type: "url" }),
];

const entryPreviewConfig = {
  select: { title: "title", society: "society", date: "date", media: "logo" },
  prepare({
    title,
    society,
    date,
    media,
  }: {
    title?: string;
    society?: string;
    date?: string;
    media?: string;
  }) {
    return {
      title,
      subtitle: [society, date].filter(Boolean).join(" · "),
      media,
    };
  },
};

const honorPreviewConfig = {
  select: {
    title: "title",
    issuer: "issuer",
    date: "date",
  },
  prepare({
    title,
    issuer,
    date,
  }: {
    title?: string;
    issuer?: string;
    date?: string;
  }) {
    return {
      title,
      subtitle: [issuer, date].filter(Boolean).join(" · "),
    };
  },
};

export const resume = defineType({
  name: "resume",
  title: "Resume",
  type: "document",
  icon: DocumentPdfIcon,
  groups: [
    { name: "profile", title: "Profile", icon: UserIcon, default: true },
    { name: "content", title: "Experience & projects", icon: CodeIcon },
    { name: "education", title: "Education & credentials", icon: BookIcon },
    { name: "skills", title: "Skills", icon: TagIcon },
    { name: "layout", title: "PDF & section order", icon: ControlsIcon },
    hiddenAllFieldsGroup,
  ],
  fields: [
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      group: "profile",
      readOnly: true,
      hidden: true,
      initialValue: defaultLocaleId,
      options: {
        list: i18nLocales.map((l) => ({ title: l.title, value: l.id })),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "firstName",
      title: "First name",
      type: "string",
      group: "profile",
      description: "Used in metadata and the PDF filename.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "lastName",
      title: "Last name",
      type: "string",
      group: "profile",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "displayName",
      title: "Display name",
      type: "string",
      description: "Shown on the page and PDF. Leave empty to show Your name.",
      group: "profile",
    }),
    defineField({
      name: "headerQuote",
      title: "Header quote",
      type: "text",
      rows: 2,
      group: "profile",
    }),
    defineField({
      name: "profilePhoto",
      title: "Profile photo",
      type: "image",
      group: "profile",
      description:
        "PDF & section order controls whether the PDF includes this photo.",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alternative text", type: "string" }),
      ],
    }),
    defineField({
      name: "contact",
      title: "Contact",
      type: "object",
      group: "profile",
      icon: UserIcon,
      description: "Public on the page and PDF.",
      options: { collapsible: false },
      fieldsets: [
        {
          name: "research",
          title: "Researcher accounts",
          options: { collapsible: true, collapsed: true },
        },
      ],
      fields: [
        defineField({ name: "email", title: "Email", type: "email" }),
        defineField({
          name: "phone",
          title: "Phone",
          type: "string",
          description:
            "Keep the country prefix and formatting you want readers to see.",
        }),
        defineField({ name: "location", title: "Location", type: "string" }),
        defineField({
          name: "homepage",
          title: "Website",
          type: "url",
          description: "Include https:// or http://.",
          validation: (rule) =>
            rule
              .uri({ scheme: ["https", "http"] })
              .warning(
                "Use a full website URL beginning with https:// or http://."
              ),
        }),
        defineField({
          name: "github",
          title: "GitHub username",
          type: "string",
          description: "Username only, without @ or https://github.com/.",
        }),
        defineField({
          name: "linkedin",
          title: "LinkedIn username",
          type: "string",
          description:
            "The identifier after /in/ in your LinkedIn profile URL.",
        }),
        defineField({
          name: "gitlab",
          title: "GitLab username",
          type: "string",
          description: "Username only, without the GitLab domain.",
        }),
        defineField({
          name: "orcid",
          title: "ORCID",
          type: "string",
          fieldset: "research",
          description:
            "Identifier only, such as 0000-0000-0000-0000; omit https://orcid.org/.",
        }),
        defineField({
          name: "researchgate",
          title: "ResearchGate username",
          type: "string",
          fieldset: "research",
          description:
            "The identifier after /profile/ in your ResearchGate URL.",
        }),
        defineField({ name: "extraInfo", title: "Extra info", type: "string" }),
      ],
    }),
    defineField({
      name: "sectionOrder",
      title: "Section order",
      type: "array",
      group: "layout",
      description: "Empty sections are hidden.",
      initialValue: [
        "education",
        "professional",
        "projects",
        "certificates",
        "publications",
        "skills",
      ],
      of: [
        defineArrayMember({
          type: "string",
          options: { list: sectionOptions },
        }),
      ],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "experiences",
      title: "Professional experience",
      type: "array",
      group: "content",
      options: collectionEditorOptions,
      of: [
        defineArrayMember({
          type: "object",
          icon: UserIcon,
          options: { collapsible: false },
          fields: experienceFields,
          preview: entryPreviewConfig,
        }),
      ],
    }),
    defineField({
      name: "projects",
      title: "Projects",
      type: "array",
      group: "content",
      description: "Separate from the website Projects collection.",
      options: collectionEditorOptions,
      of: [
        defineArrayMember({
          type: "object",
          icon: CodeIcon,
          options: { collapsible: false },
          fields: entryFields,
          preview: entryPreviewConfig,
        }),
      ],
    }),
    defineField({
      name: "education",
      title: "Education",
      type: "array",
      group: "education",
      options: collectionEditorOptions,
      of: [
        defineArrayMember({
          type: "object",
          icon: BookIcon,
          options: { collapsible: false },
          fields: entryFields,
          preview: entryPreviewConfig,
        }),
      ],
    }),
    defineField({
      name: "certificates",
      title: "Certificates",
      type: "array",
      group: "education",
      options: collectionEditorOptions,
      of: [
        defineArrayMember({
          type: "object",
          icon: DocumentTextIcon,
          options: { collapsible: false },
          fields: honorFields,
          preview: honorPreviewConfig,
        }),
      ],
    }),
    defineField({
      name: "publications",
      title: "Publications",
      type: "array",
      group: "education",
      description: "Used when no BibTeX file is supplied.",
      options: collectionEditorOptions,
      of: [
        defineArrayMember({
          type: "object",
          icon: DocumentTextIcon,
          options: { collapsible: false },
          fields: entryFields,
          preview: entryPreviewConfig,
        }),
      ],
    }),
    defineField({
      name: "publicationBibliography",
      title: "Publication bibliography",
      description: "Replaces manual publication entries.",
      type: "object",
      group: "education",
      icon: BookIcon,
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "bibFile",
          title: "BibTeX file",
          type: "file",
          options: { accept: ".bib" },
        }),
        defineField({
          name: "keys",
          title: "Citation keys",
          description: "Leave empty to render every entry in the BibTeX file.",
          type: "array",
          options: { layout: "tags" },
          of: [defineArrayMember({ type: "string" })],
        }),
        defineField({
          name: "style",
          title: "Reference style",
          type: "string",
          initialValue: "apa",
          options: {
            list: [
              { title: "APA", value: "apa" },
              { title: "IEEE", value: "ieee" },
              { title: "Chicago author-date", value: "chicago-author-date" },
            ],
          },
        }),
        defineField({
          name: "showAll",
          title: "Show all references",
          type: "boolean",
          initialValue: false,
        }),
      ],
    }),
    defineField({
      name: "skills",
      title: "Skills",
      type: "array",
      group: "skills",
      options: collectionEditorOptions,
      of: [
        defineArrayMember({
          type: "object",
          icon: TagIcon,
          options: { collapsible: false },
          fields: [
            defineField({
              name: "type",
              title: "Skill category",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "items",
              title: "Skills in this category",
              type: "array",
              options: { layout: "tags" },
              of: [defineArrayMember({ type: "string" })],
            }),
            defineField({
              name: "level",
              title: "Level",
              type: "number",
              description:
                "Optional rating for the PDF, from 1 to 5. Leave empty to omit the rating.",
              validation: (rule) => rule.integer().min(1).max(5),
            }),
            defineField({
              name: "display",
              title: "Display",
              type: "string",
              initialValue: "inline",
              options: {
                list: [
                  { title: "Inline", value: "inline" },
                  { title: "Tags", value: "tags" },
                ],
                layout: "radio",
              },
            }),
          ],
          preview: {
            select: { title: "type", items: "items" },
            prepare({ title, items }: { title?: string; items?: string[] }) {
              return {
                title,
                subtitle: Array.isArray(items) ? items.join(", ") : undefined,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "atsKeywords",
      title: "ATS keywords",
      type: "array",
      group: "skills",
      options: { layout: "tags" },
      description: "Additional keywords for applicant tracking systems.",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "object",
      group: "layout",
      icon: DocumentPdfIcon,
      options: { collapsible: false },
      description: "Applies to the PDF only.",
      fields: [
        defineField({
          name: "accentColor",
          title: "Accent color",
          type: "string",
          initialValue: "skyblue",
          options: {
            list: [
              { title: "Sky blue", value: "skyblue" },
              { title: "Red", value: "red" },
              { title: "Nephritis", value: "nephritis" },
              { title: "Concrete", value: "concrete" },
              { title: "Dark night", value: "darknight" },
            ],
          },
        }),
        defineField({
          name: "paperSize",
          title: "Paper size",
          type: "string",
          initialValue: "a4",
          options: {
            list: [
              { title: "A4", value: "a4" },
              { title: "US Letter", value: "us-letter" },
            ],
            layout: "radio",
          },
        }),
        defineField({
          name: "density",
          title: "Density",
          type: "string",
          initialValue: "standard",
          options: {
            list: [
              { title: "Compact", value: "compact" },
              { title: "Standard", value: "standard" },
              { title: "Relaxed", value: "relaxed" },
            ],
            layout: "radio",
          },
        }),
        defineField({
          name: "showProfilePhoto",
          title: "Show profile photo",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "showEntryLogos",
          title: "Show entry logos",
          type: "boolean",
          initialValue: true,
        }),
      ],
    }),
  ],
  preview: {
    select: {
      displayName: "displayName",
      language: "language",
      media: "profilePhoto",
    },
    prepare({ displayName, language, media }) {
      return {
        title: displayName || "Your name",
        subtitle: language ? language.toUpperCase() : "Resume",
        media,
      };
    },
  },
});
