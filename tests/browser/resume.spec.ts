import { expect, test } from "@playwright/test";
import { openContentPage } from "./content-page";

const NON_EMPTY_NAME = /\S/;

test("resume remains readable when application JavaScript is unavailable", async ({
  browser,
  page,
  baseURL,
}) => {
  const staticPage = await browser.newPage({
    javaScriptEnabled: false,
    viewport: page.viewportSize(),
  });
  try {
    const response = await staticPage.goto(new URL("/en/resume", baseURL).href);
    expect(response?.status()).toBe(200);
    await expect(staticPage.locator("main h1")).toBeVisible();
    await expect(
      staticPage.getByRole("link", { name: "Download PDF" })
    ).toBeVisible();
    for (const heading of await staticPage.locator("main h2").all()) {
      // biome-ignore lint/performance/noAwaitInLoops: Check every content section independently of hydration.
      await expect(heading).toBeVisible();
    }
  } finally {
    await staticPage.close();
  }
});

test("resume external entry links have names and usable pointer targets", async ({
  page,
}) => {
  await openContentPage(page, "/en/resume");
  const links = page.locator("main section a[target='_blank']");
  for (const link of await links.all()) {
    // biome-ignore lint/performance/noAwaitInLoops: Each authored entry must remain accessible.
    await expect(link).toHaveAccessibleName(NON_EMPTY_NAME);
    const bounds = await link.boundingBox();
    expect(bounds?.width).toBeGreaterThanOrEqual(24);
    expect(bounds?.height).toBeGreaterThanOrEqual(24);
  }
});
