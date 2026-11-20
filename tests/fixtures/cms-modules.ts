import type { ModuleOf } from "../../packages/cms/modules/types";

export const codeFixture = {
  _key: "code-example",
  _type: "code",
  code: 'const greeting = "<script>";\nconsole.log(greeting);',
  language: "typescript",
  filename: "example.ts",
};

export const textBlocks = (text: string) => [
  {
    _key: "text",
    _type: "block" as const,
    style: "normal" as const,
    listItem: null,
    level: null,
    markDefs: [],
    children: [{ _key: "span", _type: "span" as const, text, marks: [] }],
  },
];
const attributes = { uid: null, hidden: false };

export const moduleFixtures: [
  ModuleOf<"calloutModule">,
  ModuleOf<"galleryModule">,
  ModuleOf<"quoteModule">,
  ModuleOf<"accordionModule">,
] = [
  {
    _key: "note",
    _type: "calloutModule",
    attributes,
    title: "A useful note",
    tone: "tip",
    body: textBlocks("Reader-facing explanation."),
  },
  {
    _key: "gallery",
    _type: "galleryModule",
    attributes,
    title: "Field notes",
    columns: 2,
    images: [
      {
        _key: "image",
        alt: "A diagram",
        caption: "System sketch",
        crop: null,
        hotspot: null,
        asset: {
          _id: "image-example-2000x1000-png",
          url: "https://cdn.sanity.io/images/example/production/example-2000x1000.png",
          metadata: { dimensions: { width: 2000, height: 1000 }, lqip: null },
        },
      },
    ],
  },
  {
    _key: "quote",
    _type: "quoteModule",
    attributes,
    quote: "Simple systems are easier to understand.",
    attribution: "Example author",
    sourceLabel: "Source notes",
    sourceUrl: "https://example.com/source",
  },
  {
    _key: "accordion",
    _type: "accordionModule",
    attributes,
    title: "Implementation details",
    items: [
      {
        _key: "first",
        title: "How does it work?",
        body: textBlocks("The complete explanation."),
        open: false,
      },
    ],
  },
];
