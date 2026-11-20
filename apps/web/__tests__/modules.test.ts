import { PortableText } from "@repo/cms/components/portable-text";
import { getHeadingAnchors } from "@repo/cms/content/rich-text/headings";
import { toPlainText } from "@repo/cms/content/rich-text/plain-text";
import { validateModuleAnchors } from "@repo/cms/modules/anchors";
import { defineModule } from "@repo/cms/modules/define-module";
import {
  cleanArticleModules,
  cleanModuleControls,
} from "@repo/cms/modules/presentation";
import { VisualModuleView } from "@repo/cms/modules/renderer";
import { BLOG_INDEX_QUERY, PAGE_QUERY, POST_QUERY } from "@repo/cms/queries";
import { stegaBrand } from "@sanity/client/stega";
import { evaluate, parse } from "groq-js";
import type { PortableTextComponents } from "next-sanity";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, expectTypeOf, test, vi } from "vitest";
import {
  moduleFixtures,
  textBlocks,
} from "../../../tests/fixtures/cms-modules";

vi.mock("@repo/cms/keys", () => ({
  keys: () => ({
    NEXT_PUBLIC_SANITY_PROJECT_ID: "example",
    NEXT_PUBLIC_SANITY_DATASET: "production",
  }),
}));
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    width,
    height,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
  }) => createElement("img", { src, alt, width, height }),
}));

test("the same four module renderers work in page sections and Portable Text", () => {
  const article = renderToStaticMarkup(
    createElement(PortableText, { value: moduleFixtures })
  );
  for (const module of moduleFixtures) {
    const page = renderToStaticMarkup(
      createElement(VisualModuleView, { module })
    );
    expect(page).toContain(`data-module="${module._type}"`);
    expect(article).toContain(`data-module="${module._type}"`);
    expect(article).toContain(`id="module-${module._key}"`);
  }
  expect(article).toContain('alt="A diagram"');
  expect(article).toContain("System sketch");
  expect(article).toContain('href="https://example.com/source"');
  expect(article).toContain('data-slot="accordion-trigger"');
  expect(article).toContain("Reader-facing explanation.");
  expect(article).toContain("The complete explanation.");
  expect(article).toContain("<h2");
  expect(article).toContain('<h2 data-module-title="true">A useful note</h2>');
});

test("partial Portable Text overrides retain module renderers and heading permalinks", () => {
  const title = {
    ...textBlocks("Overview")[0],
    style: "h2",
    children: [
      { _type: "span", _key: "title", text: "Overview", marks: ["strong"] },
    ],
  };
  const components: PortableTextComponents = {
    marks: {
      strong: ({ children }) =>
        createElement("em", { "data-custom-mark": true }, children),
    },
    types: { code: () => createElement("pre", {}, "Custom code renderer") },
  };
  const html = renderToStaticMarkup(
    createElement(PortableText, {
      value: [title, ...moduleFixtures, { _type: "code", _key: "code" }],
      components,
    })
  );
  expect(html).toContain('data-custom-mark="true"');
  expect(html).toContain('href="#overview"');
  expect(html).toContain("Custom code renderer");
  for (const module of moduleFixtures) {
    expect(html).toContain(`data-module="${module._type}"`);
  }
});

test("control normalization preserves query-specific fields and leaves other content alone", () => {
  const [callout] = moduleFixtures;
  const input = stegaBrand({ ...callout, queryOnly: "Keep this field" });
  const normalized = cleanModuleControls(input);
  expect(normalized).toEqual(input);
  expectTypeOf(normalized.tone).toEqualTypeOf<typeof callout.tone>();
  expectTypeOf(normalized.queryOnly).toEqualTypeOf<typeof input.queryOnly>();
  const paragraph = textBlocks("An ordinary paragraph")[0];
  const content = cleanArticleModules([input, paragraph]);
  expect(content?.[1]).toBe(paragraph);
  expect(content?.[0]).toHaveProperty("queryOnly", "Keep this field");
});

test("hidden modules render no content and visible placements preserve their anchors", () => {
  const [callout] = moduleFixtures;
  const styled = {
    ...callout,
    attributes: {
      uid: "reader-note",
      hidden: false,
    },
  };
  const html = renderToStaticMarkup(
    createElement(VisualModuleView, { module: styled })
  );
  expect(html).toContain('id="reader-note"');
  expect(
    renderToStaticMarkup(
      createElement(VisualModuleView, {
        module: {
          ...styled,
          attributes: { ...styled.attributes, hidden: true },
        },
      })
    )
  ).toBe("");
});

test("ordinary quotations use the existing Portable Text style and inline formatting", () => {
  const content = [
    {
      ...textBlocks("An ordinary quotation")[0],
      style: "blockquote",
      children: [
        {
          _type: "span",
          _key: "quote-text",
          text: "An ordinary quotation",
          marks: ["em"],
        },
      ],
    },
  ];
  const html = renderToStaticMarkup(
    createElement(PortableText, { value: content })
  );
  expect(html).toContain("<blockquote>");
  expect(html).toContain("<em>An ordinary quotation</em>");
  expect(html).not.toContain('data-module="quoteModule"');
  expect(toPlainText(content)).toBe("An ordinary quotation");
});

test("the module wrapper preserves the Sanity schema contract and existing editor configuration", () => {
  const fields = [{ name: "title", type: "string", group: "copy" }];
  const groups = [{ name: "copy", title: "Copy", default: true }];
  const preview = { select: { title: "title" } };
  const options = { collapsible: false };
  const definition = {
    name: "exampleModule",
    type: "object" as const,
    fields,
    groups,
    preview,
    options,
  };
  const schema = defineModule(definition);
  expect(schema.name).toBe(definition.name);
  expect(schema.type).toBe("object");
  expect(schema.preview).toBe(preview);
  expect(schema.options).toBe(options);
  expect(schema.fields.slice(0, -1)).toEqual(fields);
  expect(schema.groups?.slice(0, -1)).toEqual(groups);
  expect(schema.fields.at(-1)?.name).toBe("attributes");
  expect(definition.fields).toEqual([
    { name: "title", type: "string", group: "copy" },
  ]);
  expect(definition.groups).toEqual([
    { name: "copy", title: "Copy", default: true },
  ]);
});

test("anchors reject collisions and headings avoid module destinations", () => {
  expect(
    validateModuleAnchors([
      { _key: "a", _type: "calloutModule", attributes: { uid: "notes" } },
      { _key: "b", _type: "quoteModule", attributes: { uid: "notes" } },
    ])
  ).toContain("notes");
  expect(
    validateModuleAnchors([
      { _key: "a", _type: "aboutSection", attributes: { uid: "about" } },
    ])
  ).toContain("about");
  const content = [
    { ...textBlocks("A useful note")[0], style: "h2" },
    { ...moduleFixtures[0], attributes: { uid: "a-useful-note" } },
  ];
  const [heading] = getHeadingAnchors(content);
  expect(heading.id).toBe("a-useful-note-2");
  expect(
    validateModuleAnchors([
      ...textBlocks("A paragraph does not render a module ID"),
      { ...moduleFixtures[0], attributes: { uid: "module-text" } },
    ])
  ).toBe(true);
});

test("page and article projections preserve modules without private fields", async () => {
  const modules = [
    ...structuredClone(moduleFixtures),
    { ...moduleFixtures[0], _key: "hidden", attributes: { hidden: true } },
  ];
  const dataset = [
    {
      _id: "home",
      _type: "page",
      route: "home",
      language: "en",
      sections: modules.map((module) => ({
        ...module,
        privateNote: "Internal",
      })),
    },
    {
      _id: "post",
      _type: "post",
      slug: { current: "post" },
      language: "en",
      content: modules,
    },
    {
      _id: "image-example-2000x1000-png",
      _type: "sanity.imageAsset",
      url: "https://cdn.sanity.io/images/example/production/example-2000x1000.png",
      metadata: { dimensions: { width: 2000, height: 1000 } },
    },
  ];
  // GROQ resolves images from stored references, not frontend fixture projections.
  for (const module of dataset[0].sections ?? []) {
    if (module._type === "galleryModule") {
      for (const image of module.images ?? []) {
        Object.assign(image, {
          asset: { _ref: "image-example-2000x1000-png" },
        });
      }
    }
  }
  const params = { locale: "en", route: "home", slug: "post" };
  const [page, post] = await Promise.all(
    [PAGE_QUERY, POST_QUERY].map(
      async (query) =>
        await (await evaluate(parse(query), { dataset, params })).get()
    )
  );
  expect(page.sections.map((module: { _key: string }) => module._key)).toEqual([
    "note",
    "gallery",
    "quote",
    "accordion",
  ]);
  expect(post.content.map((module: { _key: string }) => module._key)).toEqual([
    "note",
    "gallery",
    "quote",
    "accordion",
  ]);
  expect(page.sections[0]).not.toHaveProperty("privateNote");
  expect(page.sections[1].images[0].asset.url).toContain("cdn.sanity.io");
});

test("module text participates in reading text and blog search while hidden text stays out", async () => {
  const content = [
    ...moduleFixtures,
    {
      ...moduleFixtures[0],
      attributes: { hidden: true },
      body: textBlocks("secretphrase"),
    },
  ];
  const plain = toPlainText(content);
  expect(plain).toContain("Reader-facing explanation");
  expect(plain).toContain("complete explanation");
  expect(plain).not.toContain("secretphrase");
  const dataset = [
    {
      _id: "article",
      _type: "post",
      language: "en",
      slug: { current: "article" },
      title: "Example",
      content,
    },
  ];
  const find = async (search: string) => {
    const params = {
      locale: "en",
      topic: "",
      search: [search],
      start: 0,
      end: 6,
    };
    return await (
      await evaluate(parse(BLOG_INDEX_QUERY, { params }), { dataset, params })
    ).get();
  };
  expect((await find("explanation*")).total).toBe(1);
  expect((await find("secretphrase*")).total).toBe(0);
});
