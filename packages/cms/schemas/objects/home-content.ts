import { CodeIcon } from "@sanity/icons/Code";
import { CreditCardIcon } from "@sanity/icons/CreditCard";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { FolderIcon } from "@sanity/icons/Folder";
import { ImageIcon } from "@sanity/icons/Image";
import { ImagesIcon } from "@sanity/icons/Images";
import { PlayIcon } from "@sanity/icons/Play";
import { TerminalIcon } from "@sanity/icons/Terminal";
import { UserIcon } from "@sanity/icons/User";
import { defineArrayMember, defineField } from "sanity";
import { defineModule } from "../../modules/define-module";
import {
  collectionEditorOptions,
  hiddenAllFieldsGroup,
  imageAltField,
  sectionEditorOptions,
} from "../shared/editorial";

const WHITESPACE = /\s+/;

const imageFields = [
  imageAltField,
  defineField({
    name: "caption",
    title: "Image caption",
    type: "string",
    description: "Stored with the image; these widgets do not display it.",
  }),
];

export const heroSection = defineModule({
  name: "heroSection",
  title: "Hero scene",
  description:
    "GitHub links and contributions use Site settings → Links & accounts.",
  type: "object",
  icon: ImageIcon,
  options: sectionEditorOptions,
  groups: [
    {
      name: "heading",
      title: "Main heading",
      icon: UserIcon,
      default: true,
    },
    { name: "badge", title: "Badge", icon: CreditCardIcon },
    { name: "terminal", title: "Terminal", icon: TerminalIcon },
    { name: "collage", title: "Collage", icon: ImagesIcon },
    { name: "folder", title: "Folder", icon: FolderIcon },
    { name: "music", title: "Music", icon: PlayIcon },
    { name: "decorations", title: "Decorative images", icon: ImageIcon },
    hiddenAllFieldsGroup,
  ],
  fields: [
    defineField({
      name: "displayName",
      title: "Heading text",
      type: "string",
      group: "heading",
      description:
        "Also labels the heading artwork for screen readers. Leave empty to show Your name.",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "tagline",
      type: "string",
      group: "heading",
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: "nameGraphic",
      title: "Animated name graphic",
      type: "object",
      group: "heading",
      icon: CodeIcon,
      options: { collapsible: false },
      fields: [
        defineField({
          name: "viewBox",
          title: "SVG viewBox",
          type: "string",
          description: "Four space-separated numbers: x y width height.",
          validation: (rule) =>
            rule.required().custom((value) => {
              const numbers = value?.trim().split(WHITESPACE).map(Number);
              return (
                (numbers?.length === 4 &&
                  numbers.every(Number.isFinite) &&
                  numbers[2] > 0 &&
                  numbers[3] > 0) ||
                "Enter x y width height with positive width and height."
              );
            }),
        }),
        defineField({
          name: "paths",
          title: "SVG path data",
          type: "array",
          description:
            "One d attribute per entry, in drawing order. Omit SVG tags.",
          options: { collapseItemsAfter: 2 },
          of: [defineArrayMember({ type: "text", rows: 3 })],
          validation: (rule) => rule.required().min(1).max(64),
        }),
      ],
    }),
    defineField({
      name: "terminalUser",
      title: "Terminal username",
      type: "string",
      group: "terminal",
      description: "Leave empty to hide the terminal.",
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: "terminalInterests",
      title: "Terminal output",
      type: "string",
      group: "terminal",
      description: "Display text only; no commands run.",
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: "featureImage",
      title: "Featured cutout",
      type: "image",
      group: "decorations",
      options: { collapsible: false },
      description:
        "Shown beside the name without cropping. Supports transparent images.",
      fields: imageFields,
    }),
    defineField({
      name: "sticker",
      type: "image",
      group: "decorations",
      options: { collapsible: false },
      description: "Shown on desktop. Supports transparent images.",
      fields: imageFields,
    }),
    defineField({
      name: "badge",
      title: "Lanyard badge",
      type: "object",
      group: "badge",
      icon: CreditCardIcon,
      options: { collapsible: false },
      description:
        "Separate from the main heading. Remove this object to hide the lanyard.",
      groups: [
        {
          name: "identity",
          title: "Name & portrait",
          icon: UserIcon,
          default: true,
        },
        { name: "front", title: "Front text", icon: CreditCardIcon },
        { name: "back", title: "Back text", icon: DocumentTextIcon },
        hiddenAllFieldsGroup,
      ],
      fields: [
        defineField({
          name: "displayName",
          title: "Badge name",
          type: "string",
          group: "identity",
          description: "Leave empty to show Badge name.",
          validation: (rule) => rule.max(80),
        }),
        defineField({
          name: "portrait",
          title: "Badge portrait",
          type: "image",
          group: "identity",
          options: { collapsible: false, hotspot: true },
          fields: [imageAltField],
        }),
        defineField({
          name: "status",
          type: "string",
          group: "front",
          validation: (rule) => rule.max(24),
        }),
        defineField({
          name: "pass",
          title: "Pass label",
          type: "string",
          group: "front",
          validation: (rule) => rule.max(40),
        }),
        defineField({
          name: "handle",
          type: "string",
          group: "front",
          description: "Display text only; does not link to a profile.",
          validation: (rule) => rule.max(40),
        }),
        defineField({
          name: "summary",
          type: "text",
          rows: 2,
          group: "front",
          description: "Two lines: beside the handle, then below it.",
          validation: (rule) => rule.max(100),
        }),
        defineField({
          name: "details",
          type: "array",
          group: "front",
          description: "Up to three lines on the badge front.",
          of: [defineArrayMember({ type: "string" })],
          validation: (rule) => rule.max(3),
        }),
        defineField({
          name: "backTitle",
          title: "Back heading",
          type: "string",
          group: "back",
          validation: (rule) => rule.max(40),
        }),
        defineField({
          name: "backSubtitle",
          title: "Back introduction",
          type: "text",
          group: "back",
          rows: 2,
          validation: (rule) => rule.max(100),
        }),
        defineField({
          name: "backDescription",
          title: "Back description",
          type: "text",
          group: "back",
          rows: 3,
          validation: (rule) => rule.max(250),
        }),
      ],
    }),
    defineField({
      name: "gallery",
      title: "Collage photos",
      type: "array",
      group: "collage",
      description:
        "Shows the first five photos in order. Leave empty to hide the collage.",
      options: {
        layout: "grid",
        collapseItemsAfter: 6,
        modal: { type: "dialog", width: 2 },
      },
      of: [
        defineArrayMember({
          type: "image",
          options: { collapsible: false, hotspot: true },
          fields: imageFields,
        }),
      ],
      validation: (rule) => rule.max(12),
    }),
    defineField({
      name: "galleryCaption",
      title: "Collage caption",
      type: "text",
      rows: 2,
      group: "collage",
      description: "Line breaks appear on the board.",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "folderLabel",
      type: "string",
      group: "folder",
      description: "Leave empty to show Selected work in the page language.",
      validation: (rule) => rule.max(40),
    }),
    defineField({
      name: "folderItems",
      title: "Selected content",
      type: "array",
      group: "folder",
      description:
        "Up to three projects or posts in order. Leave empty to hide the folder.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "project" }, { type: "post" }],
          options: {
            disableNew: true,
            filter: ({ document }) => ({
              filter: "language == $language && defined(slug.current)",
              params: { language: document.language ?? "en" },
            }),
          },
        }),
      ],
      validation: (rule) => rule.max(3).unique(),
    }),
    defineField({
      name: "tracks",
      title: "Music tracks",
      type: "array",
      group: "music",
      options: collectionEditorOptions,
      description: "Tracks play in order. Leave empty to hide the player.",
      of: [
        defineArrayMember({
          name: "musicTrack",
          title: "Music track",
          type: "object",
          icon: PlayIcon,
          options: { collapsible: false },
          fields: [
            defineField({
              name: "title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "artist",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "cover",
              type: "image",
              options: { collapsible: false },
              fields: imageFields,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "url",
              title: "Audio URL",
              type: "url",
              description:
                "Direct HTTPS audio file URL. Streaming-service pages cannot play here.",
              validation: (rule) => rule.required().uri({ scheme: ["https"] }),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "artist", media: "cover" },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { name: "displayName" },
    prepare({ name }) {
      return {
        title: "Hero scene",
        subtitle: name || "Name, badge, media and widgets",
      };
    },
  },
});

const introductionFields = [
  defineField({
    name: "title",
    title: "Section heading",
    type: "string",
    validation: (rule) => rule.max(120),
  }),
  defineField({
    name: "description",
    type: "text",
    rows: 2,
    validation: (rule) => rule.max(350),
  }),
  defineField({
    name: "limit",
    title: "Number of items",
    type: "number",
    description: "Uses published items in the page language.",
    initialValue: 3,
    validation: (rule) => rule.integer().min(1).max(12),
  }),
];

export const projectsSection = defineModule({
  name: "projectsSection",
  title: "Projects",
  type: "object",
  icon: CodeIcon,
  options: sectionEditorOptions,
  fields: introductionFields,
  preview: {
    select: { subtitle: "title" },
    prepare({ subtitle }) {
      return {
        title: "Projects",
        subtitle: subtitle || "Recent work from the project collection",
      };
    },
  },
});

export const writingSection = defineModule({
  name: "writingSection",
  title: "Writing",
  type: "object",
  icon: DocumentTextIcon,
  options: sectionEditorOptions,
  fields: introductionFields,
  preview: {
    select: { subtitle: "title" },
    prepare({ subtitle }) {
      return {
        title: "Writing",
        subtitle: subtitle || "Recent posts from the blog collection",
      };
    },
  },
});
