import { defineArrayMember, defineType } from "sanity";
import { accordionModule } from "./accordion/schema";
import { moduleAttributes } from "./attributes";
import { calloutModule } from "./callout/schema";
import { galleryModule } from "./gallery/schema";
import { quoteModule } from "./quote/schema";

/** A text-only leaf keeps module nesting finite and keeps schema extraction predictable. */
export const moduleBody = defineType({
  name: "moduleBody",
  title: "Text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [{ title: "Normal", value: "normal" }],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
          { title: "Code", value: "code" },
        ],
      },
    }),
  ],
});

export const articleModuleSchemas = [
  calloutModule,
  galleryModule,
  quoteModule,
  accordionModule,
];
export const articleModuleMembers = articleModuleSchemas.map(({ name }) =>
  defineArrayMember({ type: name })
);
export const moduleSchemas = [
  moduleAttributes,
  moduleBody,
  ...articleModuleSchemas,
];
