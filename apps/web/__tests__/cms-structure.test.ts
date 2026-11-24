import {
  childDocumentList,
  childList,
  createStudioStructure,
  resolveStudioPage,
  type StudioPageFetcher,
  serializeStudioStructure,
} from "@repo/cms/__tests__/structure-fixture";
import { pageRoutes } from "@repo/cms/content/pages";
import {
  defaultLocaleId,
  localizedSchemaTypes,
} from "@repo/cms/studio/localization";
import { evaluate, parse } from "groq-js";
import { expect, test, vi } from "vitest";

test.each(pageRoutes)(
  "%s opens its existing source document directly",
  async (route) => {
    const fetch = vi.fn<StudioPageFetcher>();
    const { root, context } = createStudioStructure(fetch);
    const pages = childList(root.items.find((item) => item.id === "pages"));
    expect(
      pages.items.slice(0, pageRoutes.length).map((item) => item.id)
    ).toEqual(pageRoutes);
    const id = route === "home" ? "page-home-en" : `generated-${route}-id`;
    fetch.mockResolvedValueOnce(`drafts.${id}`);
    expect(await resolveStudioPage(pages, route, context)).toMatchObject({
      type: "document",
      options: { id, type: "page" },
    });
    const [query, params, options] = fetch.mock.calls.at(-1) ?? [];
    expect(options).toMatchObject({
      perspective: context.perspectiveStack,
      useCdn: false,
    });
    const dataset = [
      { _id: "translation", _type: "page", route, language: "ja" },
      { _id: "other-route", _type: "page", route: "other", language: "en" },
      { _id: id, _type: "page", route, language: defaultLocaleId },
    ];
    const result = await (
      await evaluate(parse(String(query)), { dataset, params })
    ).get();
    expect(result).toBe(id);
  }
);

test.each(pageRoutes)(
  "missing %s offers the correct creation template",
  async (route) => {
    const fetch = vi.fn<StudioPageFetcher>().mockResolvedValue(null);
    const { root, context } = createStudioStructure(fetch);
    const pages = childList(root.items.find((item) => item.id === "pages"));
    expect(await resolveStudioPage(pages, route, context)).toMatchObject({
      type: "documentList",
      schemaTypeName: "page",
      options: { params: { route, language: defaultLocaleId } },
      initialValueTemplates: [
        { templateId: `page-${route}-${defaultLocaleId}` },
      ],
    });
  }
);

test.each(localizedSchemaTypes.filter((name) => name !== "page"))(
  "%s lists source content once and keeps its creation template",
  async (type) => {
    const result = serializeStudioStructure();
    const pages = childList(result.items.find((entry) => entry.id === "pages"));
    const items = ["resume", "legalPage"].includes(type)
      ? pages.items
      : result.items;
    const item = items.find((entry) => entry.id === type);
    expect(item).toMatchObject({
      child: {
        type: "documentList",
        schemaTypeName: type,
        initialValueTemplates: [{ templateId: `${type}-${defaultLocaleId}` }],
      },
    });
    const { filter, params } = childDocumentList(item).options;
    const dataset = [
      { _id: "source", _type: type, language: defaultLocaleId },
      { _id: "translation", _type: type, language: "ja" },
      { _id: "other-type", _type: "other", language: defaultLocaleId },
      { _id: "legacy-legal", _type: "legalPage" },
    ];
    const documents = await (
      await evaluate(parse(`*[${filter}]._id`), { dataset, params })
    ).get();
    expect(documents).toEqual(
      type === "legalPage" ? ["source", "legacy-legal"] : ["source"]
    );
  }
);

test("Pages and Site Settings come first, without the removed Profile collection", () => {
  const result = serializeStudioStructure();
  expect(result.items.some((item) => item.id === "profile")).toBe(false);
  expect(result.items.slice(0, 2).map((item) => item.id)).toEqual([
    "pages",
    "settings",
  ]);
  const pages = childList(result.items.find((item) => item.id === "pages"));
  for (const id of ["resume", "legalPage"]) {
    expect(result.items.some((item) => item.id === id)).toBe(false);
    expect(
      childDocumentList(pages.items.find((item) => item.id === id))
    ).toMatchObject({
      schemaTypeName: id,
    });
  }
  expect(result.items.find((item) => item.id === "post")?.title).toBe(
    "All posts"
  );
  expect(result.items.find((item) => item.id === "project")?.title).toBe(
    "All projects"
  );
});
