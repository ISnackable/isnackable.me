import { BLOG_INDEX_QUERY } from "@repo/cms/queries";
import { blogSearchTerms } from "@repo/cms/queries/blog";
import { evaluate, parse } from "groq-js";
import { expect, test } from "vitest";
import { blogHref, parseBlogFilters } from "@/lib/blog-discovery";

const dataset = [
  ...Array.from({ length: 9 }, (_, index) => ({
    _id: `post-${index}`,
    _type: "post",
    language: "en",
    title: `Learning TypeScript ${index}`,
    description: "Practical notes",
    date: "2026-11-01",
    slug: { current: `post-${index}` },
    tags: [index % 2 ? "code" : "design"],
    content: [
      {
        _key: "body",
        _type: "block",
        children: [
          { _key: "span", _type: "span", text: "A compiler walkthrough" },
        ],
      },
    ],
    privateNote: "Editor only",
  })),
  {
    _id: "hidden",
    _type: "post",
    language: "en",
    title: "Learning hidden",
    tags: ["private"],
    slug: { current: "hidden" },
    seo: { noIndex: true },
  },
  {
    _id: "other-language",
    _type: "post",
    language: "ja",
    title: "Learning TypeScript",
    tags: ["日本語"],
    slug: { current: "translated" },
  },
  {
    _id: "no-slug",
    _type: "post",
    language: "en",
    title: "Learning unfinished",
    tags: ["unfinished"],
  },
];

async function discover(params: Record<string, unknown> = {}) {
  const parameters = {
    locale: "en",
    topic: "",
    search: [],
    start: 0,
    end: 6,
    ...params,
  };
  return await (
    await evaluate(parse(BLOG_INDEX_QUERY, { params: parameters }), {
      dataset,
      params: parameters,
    })
  ).get();
}

test("discovery counts all matches but returns a bounded, deterministic page", async () => {
  const first = await discover();
  const next = await discover({ start: 6, end: 12 });
  expect(first.total).toBe(9);
  expect(first.posts.map((post: { _id: string }) => post._id)).toEqual([
    "post-0",
    "post-1",
    "post-2",
    "post-3",
    "post-4",
    "post-5",
  ]);
  expect(next.posts.map((post: { _id: string }) => post._id)).toEqual([
    "post-6",
    "post-7",
    "post-8",
  ]);
  expect(first.posts[0]).not.toHaveProperty("privateNote");
  expect(first.tags).toEqual(["code", "design"]);
});

test("search combines with topics, searches body text, and excludes hidden and other-language posts", async () => {
  expect(
    (await discover({ search: blogSearchTerms("typescr"), topic: "code" }))
      .total
  ).toBe(4);
  expect((await discover({ search: blogSearchTerms("compiler") })).total).toBe(
    9
  );
  const missing = await discover({ search: blogSearchTerms("absent") });
  expect(missing.total).toBe(0);
  expect(missing.posts).toEqual([]);
  expect(missing.tags).toEqual(["code", "design"]);
});

test("filters bound invalid input and keep Unicode search literal", () => {
  expect(
    parseBlogFilters({
      q: ["  日本語   notes  ", "ignored"],
      tag: " code ",
      page: "-8",
    })
  ).toEqual({ q: "日本語 notes", tag: "code", page: 1 });
  expect(parseBlogFilters({ page: "99999", q: "x".repeat(300) })).toMatchObject(
    { page: 10_000, q: "x".repeat(100) }
  );
  expect(parseBlogFilters({ page: "2oops" }).page).toBe(1);
  expect(blogSearchTerms("[typescr*] 日本語? \\")).toEqual([
    "typescr*",
    "日本語*",
  ]);
});

test("pagination URLs preserve filters, escape values, and omit the default page", () => {
  const href = blogHref("en", { page: 2, q: "a & b", tag: "C++" });
  const url = new URL(href, "https://example.com");
  expect(url.searchParams.get("q")).toBe("a & b");
  expect(url.searchParams.get("tag")).toBe("C++");
  expect(url.searchParams.get("page")).toBe("2");
  expect(blogHref("en", { page: 1, q: "", tag: "" })).toBe("/en/blog");
});
