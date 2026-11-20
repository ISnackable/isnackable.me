import { resolveAbout } from "@repo/cms/content/about";
import type { AboutSectionContent } from "@repo/cms/content/pages";
import { expect, test } from "vitest";

const document = (
  overrides: Partial<AboutSectionContent> = {}
): AboutSectionContent => ({
  _key: "about",
  _type: "aboutSection",
  attributes: null,
  headline: null,
  biography: null,
  interests: null,
  ...overrides,
});

test("missing and incomplete About sections never invent personal content", () => {
  const empty = { headline: "", biography: "", interests: [] };
  expect(resolveAbout(null)).toEqual(empty);
  expect(resolveAbout(document({ biography: "   " }))).toEqual(empty);
});

test("CMS interests preserve editorial order, stable keys, media, and useful draft fields", () => {
  const image = {
    asset: {
      _id: "image-example-720x450-png",
      url: "https://cdn.sanity.io/images/example/production/example.png",
      metadata: null,
    },
    alt: "A repurposed phone",
    caption: "Lab experiment",
    crop: null,
    hotspot: null,
  };
  const result = resolveAbout(
    document({
      biography: "A revised introduction.",
      interests: [
        {
          _key: "lab",
          area: "systems",
          title: "My lab",
          description: null,
          image,
        },
        {
          _key: "code",
          area: "software",
          title: "My software work",
          description: "A workbench.",
          image: null,
        },
      ],
    })
  );
  expect(result.biography).toBe("A revised introduction.");
  expect(result.interests.map((item) => item._key)).toEqual(["lab", "code"]);
  expect(result.interests[0]).toMatchObject({
    style: "systems",
    title: "My lab",
    description: "",
    image,
  });
  expect(result.interests[1].title).toBe("My software work");
});

test("custom topics can reuse styles and exceed the original three interests", () => {
  const interests = Array.from({ length: 7 }, (_, index) => ({
    _key: `topic-${index}`,
    area: "software" as const,
    title: `Custom topic ${index + 1}`,
    description: "An independently editable subject.",
    image: null,
  }));
  const result = resolveAbout(document({ interests }));
  expect(result.interests.map((item) => item._key)).toEqual(
    interests.map((item) => item._key)
  );
  expect(result.interests.every((item) => item.style === "software")).toBe(
    true
  );
});

test("duplicate keys and unfinished draft entries cannot create broken or repeated tabs", () => {
  const entry = {
    _key: "one",
    area: "security" as const,
    title: "Research",
    description: null,
    image: null,
  };
  const result = resolveAbout(
    document({
      interests: [
        entry,
        { ...entry, title: "Duplicate key" },
        { ...entry, _key: "" },
        { ...entry, _key: "empty", area: null },
        { ...entry, _key: "untitled", area: "software", title: " " },
      ],
    })
  );
  expect(result.interests).toHaveLength(1);
  expect(result.interests[0]._key).toBe("one");
});
