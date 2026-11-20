import {
  githubUsername,
  httpsUrl,
  resolveSiteSettings,
} from "@repo/cms/content/site";
import { SETTINGS_QUERY } from "@repo/cms/queries";
import type { SETTINGS_QUERY_RESULT } from "@repo/cms/sanity.types";
import { createMetadata } from "@repo/seo/metadata";
import { evaluate, parse } from "groq-js";
import { expect, test } from "vitest";

const settings = (
  overrides: Partial<NonNullable<SETTINGS_QUERY_RESULT>> = {}
): NonNullable<SETTINGS_QUERY_RESULT> => ({
  title: null,
  description: null,
  authorName: null,
  authorUrl: null,
  publisher: null,
  twitterHandle: null,
  githubUrl: null,
  linkedinUrl: null,
  ogImage: null,
  ...overrides,
});

test("an empty CMS has neutral branding and no fabricated identity or social accounts", () => {
  const site = resolveSiteSettings(null);
  expect(site.name).toBe("Portfolio");
  expect(site.author).toEqual({ name: "", url: "" });
  expect(site.social).toEqual({ github: "", linkedin: "" });
  const metadata = createMetadata({ title: "Home", site });
  expect(metadata.authors).toBeUndefined();
  expect(metadata.creator).toBeUndefined();
  expect(metadata.title).toBe("Home | Portfolio");
});

test("the copyright holder never borrows the site or author name", () => {
  const site = resolveSiteSettings(
    settings({
      title: "Site identity",
      authorName: "Author identity",
    })
  );
  expect(site.publisher).toBe("");
});

test("site identity, authorship, descriptions, and social images come from the CMS", () => {
  const site = resolveSiteSettings(
    settings({
      title: "A studio",
      description: "Independent work.",
      authorName: "Example Author",
      authorUrl: "https://example.com",
      publisher: "Example Studio",
      twitterHandle: "@example",
      ogImage: {
        asset: {
          _id: "image-example",
          url: "https://cdn.sanity.io/images/example/social.png",
          metadata: null,
        },
        alt: null,
      },
    })
  );
  const metadata = createMetadata({ title: "Projects", site });
  expect(metadata.title).toBe("Projects | A studio");
  expect(metadata.description).toBe("Independent work.");
  expect(metadata.authors).toEqual([
    { name: "Example Author", url: "https://example.com/" },
  ]);
  expect(metadata.publisher).toBe("Example Studio");
  expect(metadata.openGraph).toMatchObject({
    siteName: "A studio",
    images: [{ url: site.image }],
  });
  expect(metadata.twitter).toMatchObject({
    creator: "@example",
    images: [site.image],
  });
});

test("CMS links cannot use script URLs, credentials, or a different host for contribution requests", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,test",
    "https://secret@example.com",
    "not a url",
  ]) {
    expect(httpsUrl(value)).toBe("");
  }
  for (const value of [
    "https://github.com.evil.example/user",
    "https://example.com/user",
    "https://github.com/user/project",
    "https://github.com/user?token=private",
  ]) {
    expect(githubUsername(value)).toBe("");
  }
  expect(githubUsername("https://github.com/example-user/")).toBe(
    "example-user"
  );
});

test("settings queries select only the singleton and expose only public fields", async () => {
  const dataset = [
    { _id: "another-settings", _type: "settings", title: "Wrong site" },
    {
      _id: "settings",
      _type: "settings",
      title: "The site",
      privateNote: "Internal",
    },
  ];
  const result = await (
    await evaluate(parse(SETTINGS_QUERY), { dataset })
  ).get();
  expect(result.title).toBe("The site");
  expect(result).not.toHaveProperty("privateNote");
});
