import { BlockContentIcon } from "@sanity/icons/BlockContent";
import { ImageIcon } from "@sanity/icons/Image";
import { UserIcon } from "@sanity/icons/User";
import { defineArrayMember, defineField } from "sanity";
import { defineModule } from "../../modules/define-module";
import {
  collectionEditorOptions,
  hiddenAllFieldsGroup,
  imageAltField,
  sectionEditorOptions,
} from "../shared/editorial";

const aboutFields = [
  defineField({
    name: "headline",
    type: "text",
    rows: 2,
    group: "introduction",
    validation: (rule) => rule.required().max(120),
  }),
  defineField({
    name: "biography",
    type: "text",
    rows: 4,
    group: "introduction",
    validation: (rule) => rule.required().max(700),
  }),
  defineField({
    name: "interests",
    type: "array",
    group: "interests",
    options: collectionEditorOptions,
    description: "Each interest appears as a tab, in this order.",
    of: [
      defineArrayMember({
        name: "profileInterest",
        title: "Interest",
        type: "object",
        icon: UserIcon,
        options: { collapsible: false, modal: { type: "dialog", width: 2 } },
        groups: [
          {
            name: "content",
            title: "Topic",
            icon: BlockContentIcon,
            default: true,
          },
          { name: "appearance", title: "Image & style", icon: ImageIcon },
          hiddenAllFieldsGroup,
        ],
        fields: [
          defineField({
            name: "area",
            title: "Illustration style",
            type: "string",
            group: "appearance",
            initialValue: "software",
            description: "Used when no image is set.",
            options: {
              list: [
                { title: "Code workspace · blue", value: "software" },
                { title: "Device lab · amber", value: "systems" },
                { title: "Flow diagram · teal", value: "security" },
              ],
            },
            validation: (rule) => rule.required(),
          }),
          defineField({
            name: "title",
            type: "string",
            group: "content",
            validation: (rule) => rule.required().max(60),
          }),
          defineField({
            name: "description",
            type: "text",
            rows: 3,
            group: "content",
            validation: (rule) => rule.required().max(350),
          }),
          defineField({
            name: "image",
            type: "image",
            group: "appearance",
            description: "Replaces the illustration.",
            options: { collapsible: false, hotspot: true },
            fields: [
              imageAltField,
              defineField({
                name: "caption",
                type: "string",
                description: "Leave empty to show the default image label.",
              }),
            ],
          }),
        ],
        preview: {
          select: {
            title: "title",
            description: "description",
            media: "image",
          },
          prepare({ title, description, media }) {
            return {
              title: title || "Untitled interest",
              subtitle: description,
              media: media || UserIcon,
            };
          },
        },
      }),
    ],
  }),
];

export const aboutSection = defineModule({
  name: "aboutSection",
  title: "About",
  type: "object",
  icon: UserIcon,
  options: sectionEditorOptions,
  groups: [
    {
      name: "introduction",
      title: "Introduction",
      icon: BlockContentIcon,
      default: true,
    },
    { name: "interests", title: "Interests", icon: UserIcon },
    hiddenAllFieldsGroup,
  ],
  fields: aboutFields,
  preview: {
    select: { headline: "headline" },
    prepare({ headline }) {
      return {
        title: "About",
        subtitle: headline || "Biography and interests",
      };
    },
  },
});
