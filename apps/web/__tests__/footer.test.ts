// @vitest-environment jsdom

import {
  LEGAL_PAGE_QUERY,
  LEGAL_PAGES_META_QUERY,
} from "@repo/cms/queries/legal";
import ja from "@repo/internationalization/messages/ja.json";
import { evaluate, parse } from "groq-js";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test, vi } from "vitest";
import { Footer } from "../app/(main)/[locale]/components/footer";

const { getLegalPages } = vi.hoisted(() => ({ getLegalPages: vi.fn() }));

vi.mock("@repo/cms", () => ({
  legal: { getPostsMeta: getLegalPages },
  settings: { get: async () => null },
}));
vi.mock("next/cache", () => ({ cacheLife: vi.fn() }));

const notice = {
  _id: "first-notice",
  slug: "site-notice",
  title: "Site notice",
};
const disclaimer = {
  _id: "second-notice",
  slug: "disclaimer",
  title: "Disclaimer",
};
const localizedNotice = "サイトに関するお知らせ";

async function renderFooterNavigation() {
  const footer = await Footer({ dictionary: ja, locale: "ja" });
  const document = new DOMParser().parseFromString(
    renderToStaticMarkup(footer),
    "text/html"
  );
  return document.querySelector("footer nav");
}

test("the footer omits Legal when the CMS has no legal pages", async () => {
  getLegalPages.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
  const navigation = await renderFooterNavigation();

  expect(navigation?.textContent).not.toContain(ja.web.footer.legal);
  expect(navigation?.querySelector('a[href="/ja/files"]')?.textContent).toBe(
    ja.common.navigation.files
  );
});

test("the footer links to the English policy until a translation is published", async () => {
  getLegalPages.mockResolvedValueOnce([]).mockResolvedValueOnce([notice]);
  const navigation = await renderFooterNavigation();

  const link = navigation?.querySelector('a[href="/en/legal/site-notice"]');
  expect(link?.textContent).toBe(notice.title);
  expect(link?.getAttribute("hreflang")).toBe("en");
  expect(navigation?.querySelector("details")).toBeNull();
});

const localizedDataset = [
  { ...notice, _type: "legalPage", slug: { current: notice.slug } },
  {
    _id: "notice-ja",
    _type: "legalPage",
    language: "ja",
    slug: { current: "oshirase" },
    title: localizedNotice,
    description: "日本語版",
    content: [
      {
        _key: "text",
        _type: "block",
        children: [{ _key: "span", _type: "span", text: "日本語の本文" }],
      },
    ],
  },
  {
    _id: "notice-translations",
    _type: "translation.metadata",
    translations: [
      { value: { _type: "reference", _ref: notice._id } },
      { value: { _type: "reference", _ref: "notice-ja" } },
    ],
  },
];

test("a single legal page uses its translated document title and slug", async () => {
  const result = await evaluate(parse(LEGAL_PAGES_META_QUERY), {
    dataset: localizedDataset,
    params: { locale: "ja", defaultLocale: "en" },
  });
  getLegalPages.mockResolvedValueOnce(await result.get());
  const navigation = await renderFooterNavigation();

  expect(getLegalPages).toHaveBeenLastCalledWith("ja");
  expect(
    navigation?.querySelector('a[href="/ja/legal/oshirase"]')?.textContent
  ).toBe(localizedNotice);
});

test("legal detail queries return the localized document and expose translations for legacy English links", async () => {
  const query = parse(LEGAL_PAGE_QUERY);
  const read = async (locale: string, slug: string) =>
    (
      await evaluate(query, {
        dataset: localizedDataset,
        params: { locale, slug, defaultLocale: "en" },
      })
    ).get();

  expect(await read("ja", "oshirase")).toMatchObject({
    title: localizedNotice,
    description: "日本語版",
    content: [{ children: [{ text: "日本語の本文" }] }],
  });
  expect(await read("ja", notice.slug)).toBeNull();
  expect(await read("en", notice.slug)).toMatchObject({
    title: notice.title,
    translations: expect.arrayContaining([
      expect.objectContaining({ language: "ja", slug: "oshirase" }),
    ]),
  });
});

test("multiple legal pages are listed under a localized disclosure", async () => {
  getLegalPages.mockResolvedValueOnce([
    { ...notice, title: localizedNotice },
    disclaimer,
  ]);
  const navigation = await renderFooterNavigation();
  const details = navigation?.querySelector("details");

  expect(details?.querySelector("summary")?.textContent).toBe(
    ja.web.footer.legal
  );
  expect(
    [...(details?.querySelectorAll("a") ?? [])].map((link) => [
      link.getAttribute("href"),
      link.textContent,
    ])
  ).toEqual([
    ["/ja/legal/site-notice", localizedNotice],
    ["/ja/legal/disclaimer", "Disclaimer"],
  ]);
});
