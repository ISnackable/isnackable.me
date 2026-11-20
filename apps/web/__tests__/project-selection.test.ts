import { PROJECTS_META_QUERY } from "@repo/cms/queries";
import { evaluate, parse } from "groq-js";
import { expect, test } from "vitest";

test("older featured projects survive the homepage limit alongside legacy records without a featured flag", async () => {
  const dataset = [
    {
      _id: "featured",
      _type: "project",
      language: "en",
      slug: { current: "featured" },
      date: "2024-01-01",
      featured: true,
    },
    ...[1, 2, 3].map((index) => ({
      _id: `recent-${index}`,
      _type: "project",
      language: "en",
      slug: { current: `recent-${index}` },
      date: `2026-01-0${index}`,
    })),
    {
      _id: "hidden",
      _type: "project",
      language: "en",
      slug: { current: "hidden" },
      date: "2026-11-01",
      featured: true,
      seo: { noIndex: true },
    },
    {
      _id: "translation",
      _type: "project",
      language: "ja",
      slug: { current: "translation" },
      date: "2026-11-01",
      featured: true,
    },
    { _id: "missing-slug", _type: "project", language: "en", featured: true },
  ];
  const params = { locale: "en", limit: 2 };
  const result = await (
    await evaluate(parse(PROJECTS_META_QUERY, { params }), { dataset, params })
  ).get();
  expect(result.map((project: { _id: string }) => project._id)).toEqual([
    "featured",
    "recent-3",
  ]);
});
