import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, test, vi } from "vitest";
import { fingerprint, restoreCapture } from "../scripts/lanyard/cache.mjs";
import { withDeadline } from "../scripts/lanyard/deadline.mjs";

let directory: string | undefined;
afterEach(async () => {
  vi.useRealTimers();
  if (directory) {
    await rm(directory, { recursive: true, force: true });
  }
  directory = undefined;
});

test("a stalled capture fails within its deadline and clears its timer", async () => {
  vi.useFakeTimers();
  const pending = withDeadline(
    new Promise(() => {
      // Deliberately never settle to exercise the deadline.
    }),
    "Capture readiness",
    30
  );
  const failure = expect(pending).rejects.toThrow(
    "Capture readiness exceeded 30ms"
  );
  await vi.advanceTimersByTimeAsync(30);
  await failure;
  expect(vi.getTimerCount()).toBe(0);
});

test("a completed capture cancels the watchdog", async () => {
  vi.useFakeTimers();
  await expect(
    withDeadline(Promise.resolve("complete"), "Capture", 30)
  ).resolves.toBe("complete");
  expect(vi.getTimerCount()).toBe(0);
});

test("capture reuse requires matching content/recipe and complete image artifacts", async () => {
  directory = await mkdtemp(path.join(tmpdir(), "lanyard-capture-test-"));
  const cache = path.join(directory, "cached");
  const output = path.join(directory, "restored");
  await mkdir(path.join(cache, "assets"), { recursive: true });
  const image = "/assets/lanyard/generated/example.webp";
  const image2x = "/assets/lanyard/generated/example-2x.webp";
  const images = {
    entrance: { src: image, src2x: image2x },
    rest: { src: image, src2x: image2x },
  };
  const key = fingerprint({ content: "current", renderer: "current" });
  const manifest = {
    version: 2,
    captureKey: key,
    previews: {
      badge: {
        contentKey: "badge",
        desktop: { light: images, dark: images },
        mobile: { light: images, dark: images },
      },
    },
  };
  await writeFile(path.join(cache, "previews.json"), JSON.stringify(manifest));
  expect(await restoreCapture(cache, key, output)).toBeUndefined();
  await writeFile(path.join(cache, "assets/example.webp"), "fixture bytes");
  expect(await restoreCapture(cache, key, output)).toBeUndefined();
  await writeFile(path.join(cache, "assets/example-2x.webp"), "retina bytes");
  expect(
    await restoreCapture(
      cache,
      fingerprint({ content: "changed", renderer: "current" }),
      output
    )
  ).toBeUndefined();
  expect(await restoreCapture(cache, key, output)).toEqual(manifest);
  expect(await readFile(path.join(output, "example.webp"), "utf8")).toBe(
    "fixture bytes"
  );
});
