import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test("resume download produces a PDF", async ({ request }) => {
  test.setTimeout(120_000);
  const response = await request.get("/en/resume/pdf", { timeout: 110_000 });
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/pdf");
  expect((await response.body()).subarray(0, 5).toString()).toBe("%PDF-");
});

test("preview PDF responses stay private after warming the published route", async ({
  request,
}) => {
  test.setTimeout(120_000);
  const preview = JSON.parse(
    await readFile(
      new URL(
        "../../apps/web/.next/server/preview-props.json",
        import.meta.url
      ),
      "utf8"
    )
  );
  const response = await request.get("/en/resume/pdf", {
    timeout: 110_000,
    headers: { cookie: `__prerender_bypass=${preview.previewModeId}` },
  });
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  expect(response.headers()["content-type"]).toContain("application/pdf");
  expect((await response.body()).subarray(0, 5).toString()).toBe("%PDF-");
});
