import {
  getDefaultHomeSections,
  type HeroSectionContent,
} from "@repo/cms/content/pages";
import { resolveSiteSettings } from "@repo/cms/content/site";
import en from "@repo/internationalization/messages/en.json";
import { createElement, type ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { expect, test, vi } from "vitest";
import { Hero } from "../app/(main)/[locale]/(home)/components/hero";

vi.mock("../lib/lanyard-previews", () => ({
  getLanyardPreview: vi.fn().mockResolvedValue(undefined),
}));

const COLLAGE_IMAGES_PATTERN = /data-collage-images="([^"]*)"/;

vi.mock("next/image", () => ({
  getImageProps: ({ src }: { src: string }) => ({
    props: { src: `/_next/image?url=${encodeURIComponent(src)}` },
  }),
  default: () => null,
}));
vi.mock("@repo/cms/components/sanity-image", () => ({
  SanityImage: () => null,
  getImageUrl: (
    image: { asset?: { url?: string } | null } | null | undefined
  ) => image?.asset?.url ?? null,
}));
vi.mock("../app/(main)/[locale]/(home)/components/folder", () => ({
  Folder: ({ children, label }: { children: ReactNode; label: string }) =>
    createElement(
      "div",
      { "data-folder": true, "aria-label": label },
      children
    ),
}));
vi.mock("../app/(main)/[locale]/(home)/components/photo-collage", () => ({
  PhotoCollage: ({
    photos,
  }: {
    photos: { asset?: { url?: string } | null }[];
  }) =>
    createElement("div", {
      "data-collage-images": JSON.stringify(
        photos.map((photo) => photo.asset?.url)
      ),
    }),
}));
vi.mock("../app/(main)/[locale]/(home)/components/lanyard", () => ({
  Lanyard: ({
    avatarUrl,
    dictionary,
  }: {
    avatarUrl: string;
    dictionary: { badgeProfile: { name: string } };
  }) =>
    createElement("div", {
      "data-badge-name": dictionary.badgeProfile.name,
      "data-badge-portrait": avatarUrl,
    }),
}));
vi.mock(
  "../app/(main)/[locale]/(home)/components/contribution-graph.server",
  () => ({
    ContributionGraphServer: () => null,
  })
);

const site = {
  ...resolveSiteSettings(null),
  name: "Unrelated site title",
  author: { name: "Unrelated author", url: "" },
  avatar: {
    asset: {
      _id: "old-avatar",
      url: "https://example.com/old-site-portrait.png",
      metadata: null,
    },
    alt: "Previous shared portrait",
  },
};

async function renderHero(
  displayName: string | null,
  badge: HeroSectionContent["badge"] = null,
  media: Pick<
    Partial<HeroSectionContent>,
    "gallery" | "folderItems" | "folderLabel"
  > = {},
  locale = "en"
) {
  const hero = getDefaultHomeSections().find(
    (section) => section._type === "heroSection"
  );
  if (!hero) {
    throw new Error("Expected the hero blueprint");
  }
  const stream = await renderToReadableStream(
    createElement(Hero, {
      content: { ...hero, displayName, badge, ...media },
      dictionary: en,
      locale,
      site,
    })
  );
  await stream.allReady;
  return new Response(stream).text();
}

test.each([null, "", "   "])(
  "a missing hero name (%s) uses the generic label even when Site Settings is populated",
  async (value) => {
    const html = await renderHero(value);
    expect(html).toContain(en.web.home.hero.placeholderName);
    expect(html).not.toContain(site.author.name);
    expect(html).not.toContain(site.name);
  }
);

test("the hero's authored name is its only personal name source", async () => {
  const html = await renderHero("Hero identity");
  expect(html).toContain("Hero identity");
  expect(html).not.toContain(en.web.home.hero.placeholderName);
  expect(html).not.toContain(site.author.name);
});

const emptyBadge: NonNullable<HeroSectionContent["badge"]> = {
  displayName: null,
  portrait: null,
  status: null,
  pass: null,
  handle: null,
  summary: null,
  details: null,
  backTitle: null,
  backSubtitle: null,
  backDescription: null,
};

test("an empty badge uses its own placeholder and never borrows the hero name or shared portrait", async () => {
  const html = await renderHero("Central heading", emptyBadge);
  expect(html).toContain('data-badge-name="Badge name"');
  expect(html).toContain('data-badge-portrait=""');
  expect(html).not.toContain(site.avatar.asset.url);
  expect(html).not.toContain('data-badge-name="Central heading"');
});

test("the badge's name and portrait come from its own fields", async () => {
  const html = await renderHero("Central heading", {
    ...emptyBadge,
    displayName: "Badge identity",
    portrait: {
      asset: {
        _id: "badge-image",
        url: "https://example.com/badge.png",
        metadata: null,
      },
      alt: "Badge portrait",
      crop: null,
      hotspot: null,
    },
  });
  expect(html).toContain('data-badge-name="Badge identity"');
  expect(html).toContain('data-badge-portrait="/_next/image?url=');
  expect(html).toContain(encodeURIComponent("https://example.com/badge.png"));
  expect(html).not.toContain(site.avatar.asset.url);
  expect(html).not.toContain(encodeURIComponent(site.avatar.asset.url));
});

function photoFixture(name: string) {
  return {
    _key: name,
    asset: {
      _id: `image-${name}`,
      url: `https://example.com/${name}.png`,
      metadata: null,
    },
    alt: `${name} photo`,
    caption: null,
    crop: null,
    hotspot: null,
  };
}

const projectEntry = {
  _key: "chosen-project",
  document: {
    _type: "project" as const,
    language: "en",
    title: "A selected project",
    slug: "selected-project",
    summary: "A project summary without an uploaded image.",
  },
};
const articleEntry = {
  _key: "chosen-article",
  document: {
    _type: "post" as const,
    language: "en",
    title: "A selected article",
    slug: "selected-article",
    summary: "An article description.",
  },
};

test.each([
  { name: "collage only", collage: true, folder: false },
  { name: "folder only", collage: false, folder: true },
  { name: "both widgets", collage: true, folder: true },
])("$name uses independent content", async ({ collage, folder }) => {
  const html = await renderHero("Main heading", null, {
    gallery: collage ? [photoFixture("collage")] : [],
    folderItems: folder ? [projectEntry, articleEntry] : [],
  });
  expect(html.includes('data-folder="true"')).toBe(folder);
  const collageImages = COLLAGE_IMAGES_PATTERN.exec(html)?.[1];
  expect(Boolean(collageImages)).toBe(collage);
  if (folder) {
    expect(html).toContain('href="/en/projects/selected-project"');
    expect(html).toContain('href="/en/blog/selected-article"');
    expect(html).toContain(projectEntry.document.summary);
    expect(html).toContain(articleEntry.document.summary);
    expect(html).toContain(en.web.home.folder.project);
    expect(html).toContain(en.web.home.folder.article);
  }
  if (collage) {
    expect(collageImages).toContain("https://example.com/collage.png");
  }
});

test("the folder uses an authored label and links within the current locale", async () => {
  const html = await renderHero(
    "Name",
    null,
    {
      folderLabel: "From my desk",
      folderItems: [projectEntry, articleEntry],
    },
    "ja"
  );
  expect(html).toContain('aria-label="From my desk"');
  expect(html).toContain('href="/ja/projects/selected-project"');
  expect(html).toContain('href="/ja/blog/selected-article"');
});

test("the folder stays hidden when no usable content is selected", async () => {
  const html = await renderHero("Name", null, {
    folderItems: [
      { ...projectEntry, document: { ...projectEntry.document, title: "   " } },
      { ...articleEntry, document: { ...articleEntry.document, slug: null } },
    ],
  });
  expect(html).not.toContain('data-folder="true"');
});
