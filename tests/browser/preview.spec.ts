import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { openContentPage } from "./content-page";

const STEGA_CHARACTERS = /[\u200b-\u200f\ufeff]/;

test("draft sessions render independently of the published cache", async ({
  page,
  baseURL,
}) => {
  // Use this local build's preview ID instead of changing the Sanity dataset
  // or bypassing the authenticated enable endpoint in deployed environments.
  const preview = JSON.parse(
    await readFile(
      new URL(
        "../../apps/web/.next/server/preview-props.json",
        import.meta.url
      ),
      "utf8"
    )
  );
  await openContentPage(page, "/en/projects");
  await expect(
    page.getByRole("link", { name: "Disable Draft Mode" })
  ).toBeHidden();

  await page.context().addCookies([
    {
      name: "__prerender_bypass",
      value: preview.previewModeId,
      url: baseURL,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  const response = await page.reload();
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Disable Draft Mode" })
  ).toBeVisible();
  expect(await page.title()).not.toMatch(STEGA_CHARACTERS);

  const article = page.locator('main a[href^="/en/projects/"]').first();
  await expect(page.locator('main [data-slot="skeleton"]')).toHaveCount(0);
  if (await article.count()) {
    await article.click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.title()).not.toMatch(STEGA_CHARACTERS);
  }

  await page.getByRole("link", { name: "Disable Draft Mode" }).click();
  await expect(page).toHaveURL((url) => url.pathname === "/en");
  await page.goto("/en/projects");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Disable Draft Mode" })
  ).toBeHidden();
  expect(await page.title()).not.toMatch(STEGA_CHARACTERS);
});
