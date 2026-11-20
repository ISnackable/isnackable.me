import { beforeEach, expect, test, vi } from "vitest";
import { LANYARD_PREVIEW_VERSION } from "../app/(main)/[locale]/(home)/components/lanyard-preview";
import { lanyardPreviewKey } from "../lib/lanyard-preview-key";
import { getLanyardPreview } from "../lib/lanyard-previews";
import { fixtureDictionary } from "./fixtures/lanyard-data";

const { readFile } = vi.hoisted(() => ({ readFile: vi.fn() }));
vi.mock("node:fs/promises", () => ({ readFile }));
vi.mock("next/cache", () => ({ cacheLife: vi.fn() }));
const portrait =
  "https://cdn.sanity.io/images/project/dataset/portrait.png?rect=0,0,512,512";
const key = lanyardPreviewKey(fixtureDictionary, portrait);
const images = {
  entrance: { src: "/entrance.webp", src2x: "/entrance-2x.webp" },
  rest: { src: "/rest.webp", src2x: "/rest-2x.webp" },
};
const preview = {
  contentKey: key,
  desktop: { light: images, dark: images },
  mobile: { light: images, dark: images },
};

beforeEach(() => {
  readFile.mockReset().mockResolvedValue(
    JSON.stringify({
      version: LANYARD_PREVIEW_VERSION,
      previews: { [key]: preview },
    })
  );
});

test("uses the matching published preview for both initial and revalidated pages", async () => {
  expect(await getLanyardPreview(fixtureDictionary, portrait)).toEqual(preview);
});

test("never flashes an old name, detail, or portrait after a CMS edit", async () => {
  for (const badgeProfile of [
    { ...fixtureDictionary.badgeProfile, name: "New name" },
    { ...fixtureDictionary.badgeProfile, details: ["Updated detail"] },
  ]) {
    expect(
      // biome-ignore lint/performance/noAwaitInLoops: Exercise each independent invalidation case.
      await getLanyardPreview({ ...fixtureDictionary, badgeProfile }, portrait)
    ).toBeUndefined();
  }
  expect(
    await getLanyardPreview(fixtureDictionary, `${portrait}&crop=top`)
  ).toBeUndefined();
});

test("back-only edits retain the current front preview", async () => {
  expect(
    await getLanyardPreview(
      {
        ...fixtureDictionary,
        cardBackProfile: {
          ...fixtureDictionary.cardBackProfile,
          title: "Updated access",
        },
      },
      portrait
    )
  ).toEqual(preview);
});

test("omits missing, incompatible, or mismatched preview artifacts", async () => {
  readFile.mockRejectedValueOnce(
    Object.assign(new Error("Missing"), { code: "ENOENT" })
  );
  expect(await getLanyardPreview(fixtureDictionary, portrait)).toBeUndefined();
  readFile.mockResolvedValueOnce(
    JSON.stringify({ version: -1, previews: { [key]: preview } })
  );
  expect(await getLanyardPreview(fixtureDictionary, portrait)).toBeUndefined();
  readFile.mockResolvedValueOnce(
    JSON.stringify({
      version: LANYARD_PREVIEW_VERSION,
      previews: { [key]: { ...preview, contentKey: "outdated" } },
    })
  );
  expect(await getLanyardPreview(fixtureDictionary, portrait)).toBeUndefined();
});
