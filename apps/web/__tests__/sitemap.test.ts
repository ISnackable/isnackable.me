import { pageRoutes } from "@repo/cms/content/pages";
import { evaluate, parse } from "groq-js";
import { beforeEach, expect, test, vi } from "vitest";
import createSitemap from "../app/sitemap";

const { cachedSanity } = vi.hoisted(() => ({ cachedSanity: vi.fn() }));
vi.mock("@repo/cms/keys", () => ({
  keys: () => ({ NEXT_PUBLIC_SANITY_PROJECT_ID: "example" }),
}));
vi.mock("@repo/cms/live", () => ({ cachedSanity }));
vi.mock("@/env", () => ({
  env: { NEXT_PUBLIC_WEB_URL: "https://example.com" },
}));

let dataset: Record<string, unknown>[];

beforeEach(() => {
  dataset = [];
  cachedSanity.mockReset();
  cachedSanity.mockImplementation(async ({ query }: { query: string }) => ({
    data: await (await evaluate(parse(query), { dataset })).get(),
  }));
});

test("an empty CMS retains static routes without inventing modification dates", async () => {
  const entries = await createSitemap();
  expect(entries.map((entry) => entry.url)).toEqual(
    expect.arrayContaining([
      "https://example.com/en",
      "https://example.com/en/blog",
      "https://example.com/en/projects",
      "https://example.com/en/resume",
    ])
  );
  expect(entries.every((entry) => entry.lastModified === undefined)).toBe(true);
  expect(cachedSanity).toHaveBeenCalledWith(
    expect.objectContaining({
      perspective: "published",
      stega: false,
      tags: expect.arrayContaining(["page"]),
    })
  );
});

test.each(pageRoutes)(
  "%s visibility can be hidden and restored independently for each language",
  async (route) => {
    const path = route === "home" ? "" : `/${route}`;
    const updatedAt = "2026-11-01T12:00:00Z";
    const document = {
      _id: "page-source",
      _type: "page",
      route,
      language: "en",
      _updatedAt: updatedAt,
      seo: { noIndex: true },
    };
    dataset = [document];
    const hidden = (await createSitemap()).map((entry) => entry.url);
    expect(hidden).not.toContain(`https://example.com/en${path}`);
    expect(hidden).toContain(`https://example.com/ja${path}`);
    dataset = [{ ...document, seo: { noIndex: false } }];
    const restored = await createSitemap();
    expect(
      restored.find((entry) => entry.url === `https://example.com/en${path}`)
        ?.lastModified
    ).toEqual(new Date(updatedAt));
  }
);

test("hidden detail documents stay excluded while published translations and legal pages retain their paths", async () => {
  dataset = [
    {
      _type: "post",
      slug: { current: "visible-post" },
      language: "ja",
    },
    {
      _type: "project",
      slug: { current: "hidden-project" },
      language: "en",
      seo: { noIndex: true },
    },
    { _type: "legalPage", slug: { current: "privacy" } },
    { _type: "legalPage", language: "zh", slug: { current: "yinsi" } },
  ];
  const urls = (await createSitemap()).map((entry) => entry.url);
  expect(urls).toContain("https://example.com/ja/blog/visible-post");
  expect(urls).not.toContain("https://example.com/en/blog/visible-post");
  expect(urls).not.toContain("https://example.com/en/projects/hidden-project");
  expect(urls).not.toContain("https://example.com/en/legal");
  expect(urls).toContain("https://example.com/en/legal/privacy");
  expect(urls).toContain("https://example.com/zh/legal/yinsi");
  expect(urls).not.toContain("https://example.com/zh/legal/privacy");
  expect(urls).not.toContain("https://example.com/ja/legal/privacy");
});

test("a CMS failure falls back to static routes without issuing competing queries", async () => {
  cachedSanity.mockRejectedValueOnce(new Error("CMS unavailable"));
  expect((await createSitemap()).map((entry) => entry.url)).toContain(
    "https://example.com/en"
  );
  expect(cachedSanity).toHaveBeenCalledTimes(1);
});

test("legacy duplicate pages use the same earliest document as public metadata", async () => {
  dataset = [
    {
      _id: "canonical",
      _type: "page",
      route: "home",
      language: "en",
      _createdAt: "2026-01-01T00:00:00Z",
      seo: { noIndex: false },
    },
    {
      _id: "later-duplicate",
      _type: "page",
      route: "home",
      language: "en",
      _createdAt: "2026-02-01T00:00:00Z",
      seo: { noIndex: true },
    },
  ];
  expect((await createSitemap()).map((entry) => entry.url)).toContain(
    "https://example.com/en"
  );
});
