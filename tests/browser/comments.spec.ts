import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { getGiscusConfig } from "../../packages/comments/config";
import { openContentPage } from "./content-page";

test("configured comments follow the theme and stay out of draft previews", async ({
  page,
  baseURL,
}) => {
  test.skip(
    !getGiscusConfig({
      GISCUS_REPO: process.env.GISCUS_REPO,
      GISCUS_REPO_ID: process.env.GISCUS_REPO_ID,
      GISCUS_CATEGORY: process.env.GISCUS_CATEGORY,
      GISCUS_CATEGORY_ID: process.env.GISCUS_CATEGORY_ID,
    }),
    "Run with the four GISCUS_* identifiers configured at build and start time."
  );
  // Exercise the real widget while keeping this regression test off GitHub.
  await page.route("https://giscus.app/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>Comments fixture</title>",
    })
  );
  await page.addInitScript(() => {
    if (window === window.top) {
      localStorage.setItem("theme", "light");
    }
  });
  await openContentPage(page, "/en/blog");
  const article = page.locator('main a[href^="/en/blog/"]').first();
  test.skip(
    (await article.count()) === 0,
    "Publish a post to verify comments."
  );
  await article.click();
  const widget = page.locator("giscus-widget");
  await expect(widget).toBeAttached();
  await expect(widget).toHaveAttribute("mapping", "specific");
  await expect(widget).toHaveJSProperty("theme", "light");
  const term = await widget.getAttribute("term");
  expect(term?.startsWith("post:")).toBe(true);
  await page.getByRole("button", { name: "Toggle theme" }).click();
  // Giscus updates the live property and sends iframe messages after mounting;
  // its initial reflected HTML attribute intentionally stays unchanged.
  await expect(widget).toHaveJSProperty("theme", "dark");
  await page.reload();
  await expect(widget).toHaveAttribute("term", term as string);

  const preview = JSON.parse(
    await readFile(
      new URL(
        "../../apps/web/.next/server/preview-props.json",
        import.meta.url
      ),
      "utf8"
    )
  );
  await page.context().addCookies([
    {
      name: "__prerender_bypass",
      value: preview.previewModeId,
      url: baseURL,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  await page.reload();
  await expect(
    page.getByRole("link", { name: "Disable Draft Mode" })
  ).toBeVisible();
  await expect(widget).toHaveCount(0);
});
