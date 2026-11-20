import { expect, type Page } from "@playwright/test";

/** Wait for streamed CMS sections before deciding whether optional content exists. */
export async function openContentPage(page: Page, path: string) {
  const response = await page.goto(path);
  await expect(page.locator("main h1")).toBeAttached();
  await expect(page.locator('main [data-slot="skeleton"]')).toHaveCount(0);
  return response;
}
