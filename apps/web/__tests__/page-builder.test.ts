import {
  getDefaultHomeSections,
  getPageInitialValue,
  pageRoutes,
} from "@repo/cms/content/pages";
import { PAGE_QUERY } from "@repo/cms/queries";
import { PAGE_IDENTITY_CONFLICT_QUERY } from "@repo/cms/schemas/utils/page";
import {
  getNewDocumentOptions,
  pageTemplates,
} from "@repo/cms/studio/templates";
import { evaluate, parse } from "groq-js";
import { expect, test } from "vitest";

async function readPage(sections: unknown[], content: unknown[] = []) {
  const params = { route: "home", locale: "en" };
  const dataset = [
    ...content,
    {
      _id: "imported-home-en",
      _type: "page",
      route: "home",
      language: "en",
      title: "Home",
      sections,
      privateNote: "Internal",
    },
    {
      _id: "image-badge",
      _type: "sanity.imageAsset",
      url: "https://example.com/badge.png",
    },
  ];
  return await (
    await evaluate(parse(PAGE_QUERY, { params }), { dataset, params })
  ).get();
}

test("page projections retain editorial order, stable keys, and animated name paths", async () => {
  const crop = { top: 0.1, bottom: 0, left: 0.2, right: 0 };
  const hotspot = { x: 0.8, y: 0.5, width: 0.1, height: 0.2 };
  const nameGraphic = {
    viewBox: "0 0 100 50",
    paths: ["M 0 0 L 100 50", "M 10 0 L 20 40"],
  };
  const page = await readPage([
    {
      _key: "work",
      _type: "projectsSection",
      title: "Recent work",
      limit: 2,
      internalNote: "Private",
    },
    {
      _key: "intro",
      _type: "heroSection",
      displayName: "Example Name",
      badge: {
        displayName: "Separate badge name",
        portrait: { asset: { _ref: "image-badge" }, alt: "Badge portrait" },
      },
      gallery: [{ _key: "collage", alt: "Collage photo", crop, hotspot }],
      wordmark: { asset: { _ref: "image-badge" }, alt: "Retired static name" },
      nameGraphic,
    },
    { _key: "notes", _type: "writingSection", title: "Notes", limit: 4 },
  ]);
  expect(
    page.sections.map((section: { _key: string }) => section._key)
  ).toEqual(["work", "intro", "notes"]);
  expect(page.sections[0]).toMatchObject({ title: "Recent work", limit: 2 });
  expect(page.sections[1]).toMatchObject({
    displayName: "Example Name",
    badge: {
      displayName: "Separate badge name",
      portrait: {
        alt: "Badge portrait",
        asset: { url: "https://example.com/badge.png" },
      },
    },
    nameGraphic,
    gallery: [{ _key: "collage", alt: "Collage photo", crop, hotspot }],
    folderItems: null,
  });
  expect(page.sections[2]).toMatchObject({ title: "Notes", limit: 4 });
  expect(page).not.toHaveProperty("privateNote");
  expect(page.sections[0]).not.toHaveProperty("internalNote");
  expect(page.sections[1]).not.toHaveProperty("wordmark");
});

test("folder references preserve curated keys and order, resolve both content types, and exclude unavailable or other-language content", async () => {
  const documents = [
    {
      _id: "project",
      _type: "project",
      language: "en",
      title: "Project",
      slug: { current: "project" },
      summary: "Project summary",
      coverImage: { private: true },
    },
    {
      _id: "post",
      _type: "post",
      language: "en",
      title: "Article",
      slug: { current: "article" },
      description: "Article description",
      content: "Not needed in the hero",
    },
    {
      _id: "japanese",
      _type: "post",
      language: "ja",
      slug: { current: "article-ja" },
    },
    { _id: "no-slug", _type: "project", language: "en" },
    {
      _id: "drafts.unpublished",
      _type: "post",
      language: "en",
      slug: { current: "draft" },
    },
    {
      _id: "third",
      _type: "project",
      language: "en",
      title: "Third",
      slug: { current: "third" },
    },
    {
      _id: "fourth",
      _type: "project",
      language: "en",
      title: "Fourth",
      slug: { current: "fourth" },
    },
  ];
  const page = await readPage(
    [
      {
        _type: "heroSection",
        _key: "hero",
        folderLabel: "From my desk",
        folderItems: [
          "missing",
          "japanese",
          "no-slug",
          "unpublished",
          "post",
          "project",
          "third",
          "fourth",
        ].map((id) => ({
          _type: "reference",
          _key: `placement-${id}`,
          _ref: id,
        })),
      },
    ],
    documents
  );
  expect(page.sections[0].folderLabel).toBe("From my desk");
  expect(page.sections[0].folderItems).toEqual([
    {
      _key: "placement-post",
      document: {
        _type: "post",
        title: "Article",
        slug: "article",
        summary: "Article description",
      },
    },
    {
      _key: "placement-project",
      document: {
        _type: "project",
        title: "Project",
        slug: "project",
        summary: "Project summary",
      },
    },
    {
      _key: "placement-third",
      document: {
        _type: "project",
        title: "Third",
        slug: "third",
        summary: null,
      },
    },
  ]);
});

test("removing all sections does not restore a personal scene or deleted sections", async () => {
  expect((await readPage([])).sections).toEqual([]);
  expect(
    getDefaultHomeSections().find((section) => section._type === "heroSection")
  ).toMatchObject({
    displayName: null,
    nameGraphic: null,
    badge: null,
    gallery: null,
    folderItems: null,
  });
});

test.each(pageRoutes)(
  "%s metadata ignores removed Home fields and preserves index-page inheritance",
  async (route) => {
    const params = { route, locale: "en" };
    const query = parse(PAGE_QUERY, { params });
    const document = {
      _id: "page-source",
      _type: "page",
      route,
      language: "en",
      title: "Stored page title",
      description: "Stored page description",
    };
    const result = await (
      await evaluate(query, { dataset: [document], params })
    ).get();
    if (route === "home") {
      expect(result).toMatchObject({
        title: null,
        description: null,
        seo: { title: "", description: "" },
      });
    } else {
      expect(result).toMatchObject({
        title: document.title,
        description: document.description,
        seo: { title: document.title, description: document.description },
      });
    }
    const seo = { title: "SEO title", description: "SEO description" };
    const authored = await (
      await evaluate(query, { dataset: [{ ...document, seo }], params })
    ).get();
    expect(authored.seo).toMatchObject(seo);
  }
);

test("page blueprints expose route-specific English templates and translations use the plugin", () => {
  expect(pageTemplates).toHaveLength(3);
  expect(
    getNewDocumentOptions(
      pageTemplates.map((template) => ({ templateId: template.id }))
    ).map((item) => item.templateId)
  ).toEqual(["page-home-en", "page-blog-en", "page-projects-en"]);
  const blueprint = getPageInitialValue("home", "zh");
  expect(blueprint.language).toBe("zh");
  expect(blueprint).not.toHaveProperty("title");
  expect(blueprint).not.toHaveProperty("description");
  expect(blueprint.sections?.map((section) => section._type)).toEqual([
    "heroSection",
    "aboutSection",
    "projectsSection",
    "writingSection",
  ]);
  expect(blueprint.sections?.[0]).not.toHaveProperty("displayName");
});

test("page queries accept imported and plugin-generated IDs without crossing routes or languages", async () => {
  const dataset = [
    {
      _id: "page-home-en",
      _type: "page",
      route: "home",
      language: "en",
      title: "Imported home",
      _createdAt: "2026-01-01T00:00:00Z",
    },
    {
      _id: "plugin-generated-translation",
      _type: "page",
      route: "home",
      language: "ja",
      title: "Translated home",
      _createdAt: "2026-02-01T00:00:00Z",
    },
    {
      _id: "blog-ja",
      _type: "page",
      route: "blog",
      language: "ja",
      title: "Blog",
      _createdAt: "2026-01-01T00:00:00Z",
    },
  ];
  for (const [locale, id] of [
    ["en", "page-home-en"],
    ["ja", "plugin-generated-translation"],
  ]) {
    const params = { route: "home", locale };
    // biome-ignore lint/performance/noAwaitInLoops: Each fixture verifies a distinct route/language query.
    const result = await (
      await evaluate(parse(PAGE_QUERY, { params }), { dataset, params })
    ).get();
    expect(result._id).toBe(id);
  }
  const params = { route: "projects", locale: "ja" };
  expect(
    await (
      await evaluate(parse(PAGE_QUERY, { params }), { dataset, params })
    ).get()
  ).toBeNull();
});

test("page identity validation excludes its own draft and published copy while detecting duplicate translations", async () => {
  const params = {
    published: "page-home-en",
    draft: "drafts.page-home-en",
    route: "home",
    language: "en",
  };
  const dataset = [
    { _id: params.published, _type: "page", route: "home", language: "en" },
    { _id: params.draft, _type: "page", route: "home", language: "en" },
    {
      _id: "versions.release.page-home-en",
      _type: "page",
      route: "home",
      language: "en",
    },
    { _id: "translated", _type: "page", route: "home", language: "ja" },
  ];
  const query = parse(PAGE_IDENTITY_CONFLICT_QUERY, { params });
  expect(await (await evaluate(query, { dataset, params })).get()).toBe(0);
  dataset.push({
    _id: "accidental-copy",
    _type: "page",
    route: "home",
    language: "en",
  });
  expect(await (await evaluate(query, { dataset, params })).get()).toBe(1);
});
