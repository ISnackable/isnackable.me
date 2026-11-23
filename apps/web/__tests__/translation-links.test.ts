import { getTranslationLinks } from "@repo/cms/content/translations";
import { POST_QUERY, PROJECT_QUERY } from "@repo/cms/queries";
import { evaluate, parse } from "groq-js";
import { expect, test } from "vitest";
import { getPortfolioLanguageSwitchPath } from "../i18n/switch-path";

for (const [collection, type, query] of [
  ["blog", "post", POST_QUERY],
  ["projects", "project", PROJECT_QUERY],
] as const) {
  test(`${collection} alternates follow actual translation references and localized slugs`, async () => {
    const dataset = [
      {
        _id: "source",
        _type: type,
        language: "en",
        slug: { current: "english-slug" },
      },
      {
        _id: "translated",
        _type: type,
        language: "ja",
        slug: { current: "日本語" },
      },
      {
        _id: "unrelated",
        _type: type,
        language: "zh",
        slug: { current: "english-slug" },
      },
      {
        _id: "hidden",
        _type: type,
        language: "zh",
        slug: { current: "hidden" },
        seo: { noIndex: true },
      },
      {
        _id: "metadata",
        _type: "translation.metadata",
        translations: ["source", "translated", "hidden", "missing"].map(
          (_ref) => ({ value: { _type: "reference", _ref } })
        ),
      },
    ];
    const params = { locale: "en", slug: "english-slug" };
    const result = await (
      await evaluate(parse(query, { params }), { dataset, params })
    ).get();
    expect(
      getTranslationLinks(
        collection,
        { locale: "en", slug: "english-slug" },
        result.translations
      )
    ).toEqual({
      en: `/en/${collection}/english-slug`,
      ja: `/ja/${collection}/${encodeURIComponent("日本語")}`,
    });
  });
}

test("switching language uses a translated slug or a localized collection index", () => {
  expect(
    getPortfolioLanguageSwitchPath(
      "/blog/original",
      "ja",
      "https://example.com/ja/blog/translated"
    )
  ).toBe("/blog/translated");
  expect(getPortfolioLanguageSwitchPath("/projects/original", "zh")).toBe(
    "/projects"
  );
  expect(
    getPortfolioLanguageSwitchPath(
      "/blog/original",
      "ja",
      "/ja/projects/wrong-collection"
    )
  ).toBe("/blog");
  expect(getPortfolioLanguageSwitchPath("/blog/original", "ja", "/ja")).toBe(
    "/blog"
  );
  expect(getPortfolioLanguageSwitchPath("/resume", "ja")).toBe("/resume");
  expect(getPortfolioLanguageSwitchPath("/resume", "ja", "/ja/resume")).toBe(
    "/resume"
  );
  expect(getPortfolioLanguageSwitchPath("/legal/privacy", "zh")).toBe(
    "/legal/privacy"
  );
});
