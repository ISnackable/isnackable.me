import { test, expect } from "@playwright/test";

test("should contains 'Hey there' in home page", async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto("http://localhost:3000/");

  // The new page should contain an h1 with "Hey there"
  await expect(page.locator("h1")).toContainText("Hey there");
});
