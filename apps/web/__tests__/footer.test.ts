// @vitest-environment jsdom

import { LEGAL_PAGES_META_QUERY } from "@repo/cms/queries/legal";
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
  getLegalPages.mockResolvedValueOnce([]);
  const navigation = await renderFooterNavigation();

  expect(navigation?.textContent).not.toContain(ja.web.footer.legal);
  expect(navigation?.querySelector('a[href="/ja/files"]')?.textContent).toBe(
    ja.common.navigation.files
  );
});

test("a single legal page uses the localized label and the CMS slug", async () => {
  getLegalPages.mockResolvedValueOnce([notice]);
  const navigation = await renderFooterNavigation();

  expect(
    navigation?.querySelector('a[href="/ja/legal/site-notice"]')?.textContent
  ).toBe(ja.web.footer.legal);
  expect(navigation?.querySelector("details")).toBeNull();
});

test("a single legal page uses the Sanity label for the requested language", async () => {
  const result = await evaluate(parse(LEGAL_PAGES_META_QUERY), {
    dataset: [
      {
        ...notice,
        _type: "legalPage",
        slug: { current: notice.slug },
        navigationLabel: [
          { _key: "english", language: "en", value: "Notice" },
          { _key: "japanese", language: "ja", value: localizedNotice },
        ],
      },
    ],
    params: { locale: "ja" },
  });
  getLegalPages.mockResolvedValueOnce(await result.get());
  const navigation = await renderFooterNavigation();

  expect(getLegalPages).toHaveBeenLastCalledWith("ja");
  expect(
    navigation?.querySelector('a[href="/ja/legal/site-notice"]')?.textContent
  ).toBe(localizedNotice);
});

test("multiple legal pages are listed under a localized disclosure", async () => {
  getLegalPages.mockResolvedValueOnce([
    { ...notice, navigationLabel: localizedNotice },
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
