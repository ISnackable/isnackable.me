import en from "@repo/internationalization/messages/en.json";
import { beforeEach, expect, test, vi } from "vitest";
import { generateMetadata as blogPostMetadata } from "../app/(main)/[locale]/blog/[slug]/page";
import { generateMetadata as blogIndexMetadata } from "../app/(main)/[locale]/blog/page";
import { generateMetadata as legalMetadata } from "../app/(main)/[locale]/legal/[slug]/page";
import { generateMetadata as projectMetadata } from "../app/(main)/[locale]/projects/[slug]/page";
import { generateMetadata as projectsIndexMetadata } from "../app/(main)/[locale]/projects/page";
import { createWebMetadata } from "../lib/metadata";

const { getPage, getPost, getProject, getLegal, getSettings } = vi.hoisted(
  () => ({
    getPage: vi.fn(),
    getPost: vi.fn(),
    getProject: vi.fn(),
    getLegal: vi.fn(),
    getSettings: vi.fn(),
  })
);
vi.mock("@repo/cms", () => ({
  pages: { get: getPage },
  blog: { getPost },
  projects: { getPost: getProject },
  legal: { getPost: getLegal },
  settings: { get: getSettings },
}));
vi.mock("@repo/cms/client", () => ({
  client: { config: () => ({ projectId: "example", dataset: "production" }) },
}));
vi.mock("@repo/internationalization/dictionaries", () => ({
  getPortfolioDictionary: async () => en,
}));
vi.mock("@/i18n/locale", () => ({ getPortfolioLocale: async () => "en" }));
vi.mock("@/env", () => ({
  env: { NEXT_PUBLIC_WEB_URL: "https://example.com" },
}));

beforeEach(() => {
  vi.clearAllMocks();
  getSettings.mockResolvedValue({
    title: "Example site",
    description: "Default site description",
  });
});

test.each([
  ["Blog", blogIndexMetadata],
  ["Projects", projectsIndexMetadata],
] as const)(
  "%s descriptions inherit Site Settings when their own fields are empty",
  async (_name, generate) => {
    getPage.mockResolvedValue({
      title: "Page heading",
      description: "",
      seo: { title: "Page heading", description: "", noIndex: false },
    });
    const inherited = await generate();
    expect(inherited.description).toBe("Default site description");
    expect(inherited.openGraph?.description).toBe("Default site description");
    getPage.mockResolvedValue({
      title: "Page heading",
      description: "Visible introduction",
      seo: {
        title: "Page heading",
        description: "SEO description",
        noIndex: true,
      },
    });
    const authored = await generate();
    expect(authored.description).toBe("SEO description");
    expect(authored.robots).toMatchObject({ index: false, follow: false });
  }
);

test.each([
  ["Post", blogPostMetadata, getPost],
  ["Project", projectMetadata, getProject],
  ["Legal page", legalMetadata, getLegal],
] as const)(
  "%s metadata respects search visibility without changing document availability",
  async (_name, generate, fetchDocument) => {
    const params = { locale: "en", slug: "entry" };
    const document = {
      title: "Document title",
      seo: {
        title: "SEO title",
        description: "SEO description",
        noIndex: true,
      },
      translations: [],
    };
    const response = (value: typeof document) =>
      fetchDocument === getLegal ? { ...params, document: value } : value;
    fetchDocument.mockResolvedValue(response(document));
    expect(
      (await generate({ params: Promise.resolve(params) })).robots
    ).toMatchObject({
      index: false,
      follow: false,
    });
    fetchDocument.mockResolvedValue(
      response({ ...document, seo: { ...document.seo, noIndex: false } })
    );
    expect(
      (await generate({ params: Promise.resolve(params) })).robots
    ).toBeUndefined();
    fetchDocument.mockResolvedValue(null);
    expect(await generate({ params: Promise.resolve(params) })).toEqual({});
  }
);

test("post metadata declares the canonical URL and actual translations using published content", async () => {
  getPost.mockResolvedValue({
    title: "Article",
    date: "2026-11-01T00:00:00Z",
    translations: [{ _type: "post", language: "ja", slug: "日本語" }],
  });

  const metadata = await blogPostMetadata({
    params: Promise.resolve({ locale: "en", slug: "first post" }),
  });
  expect(metadata.alternates).toEqual({
    canonical: new URL("https://example.com/en/blog/first%20post"),
    languages: {
      en: "/en/blog/first%20post",
      ja: "/ja/blog/%E6%97%A5%E6%9C%AC%E8%AA%9E",
      "x-default": "/en/blog/first%20post",
    },
  });
  expect(metadata.openGraph).toMatchObject({
    type: "article",
    url: new URL("https://example.com/en/blog/first%20post"),
    alternateLocale: ["ja_JP"],
    publishedTime: "2026-11-01T00:00:00Z",
  });
  expect(metadata.openGraph).not.toHaveProperty("images");
  expect(metadata.twitter).not.toHaveProperty("images");
  expect(getPost).toHaveBeenCalledWith("first post", "en", {
    perspective: "published",
    stega: false,
  });
});

test("legacy legal URLs use the resolved document's canonical URL and alternates", async () => {
  getLegal.mockResolvedValue({
    locale: "ja",
    slug: "oshirase",
    document: { title: "お知らせ", translations: [] },
  });
  const metadata = await createWebMetadata(
    { kind: "legal", slug: "old-notice" },
    "ja"
  );
  expect(metadata.alternates).toEqual({
    canonical: "https://example.com/ja/legal/oshirase",
    languages: { ja: "/ja/legal/oshirase" },
  });
});

test("the homepage upload stays on the homepage and page uploads stay on their own cards", async () => {
  const defaultUrl = "https://cdn.sanity.io/images/example/default.png";
  const pageUrl = "https://cdn.sanity.io/images/example/custom.png";
  getSettings.mockResolvedValue({
    title: "Example site",
    ogImage: { asset: { url: defaultUrl }, alt: "Homepage artwork" },
  });
  getPage.mockResolvedValue(null);
  const legal = { locale: "en", slug: "privacy" };
  getLegal.mockResolvedValue({ ...legal, document: { title: "Privacy" } });

  const props = { params: Promise.resolve({ locale: "en", slug: "privacy" }) };
  const homepage = await createWebMetadata({ kind: "home" }, "en");
  expect(homepage.openGraph?.images).toEqual([
    { url: defaultUrl, alt: "Homepage artwork" },
  ]);
  const generated = await legalMetadata(props);
  expect(generated.openGraph).not.toHaveProperty("images");
  expect(generated.twitter).not.toHaveProperty("images");
  getLegal.mockResolvedValue({
    ...legal,
    document: {
      title: "Privacy",
      seo: { image: { asset: { url: pageUrl }, alt: "Custom artwork" } },
    },
  });
  const own = await legalMetadata(props);
  expect(own.openGraph?.images).toEqual([
    { url: pageUrl, alt: "Custom artwork" },
  ]);
  expect(own.twitter?.images).toEqual([
    { url: pageUrl, alt: "Custom artwork" },
  ]);
});
