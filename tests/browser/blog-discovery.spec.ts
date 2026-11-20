import { expect, test } from "@playwright/test";
import { openContentPage } from "./content-page";

const searchUrl = /q=no-results-7f5b1289/;
const blogUrl = /\/en\/blog$/;
const filteredUrl = /\/en\/blog\?q=no-results-7f5b1289&tag=unknown-topic$/;

test("blog search preserves shareable filters and clears back to the index", async ({
  page,
}, testInfo) => {
  await openContentPage(page, "/en/blog");
  await expect(page.getByRole("search")).toBeVisible();
  const resultSpacing = await page.getByRole("main").evaluate((main) => {
    const search = main.querySelector("search")?.getBoundingClientRect();
    const status = main
      .querySelector('[role="status"]')
      ?.getBoundingClientRect();
    return (status?.top ?? 0) - (search?.bottom ?? 0);
  });
  expect(resultSpacing).toBeGreaterThanOrEqual(20);
  expect(resultSpacing).toBeLessThanOrEqual(32);
  await page.screenshot({
    path: testInfo.outputPath("blog-index.png"),
    fullPage: true,
  });
  await page
    .getByRole("searchbox", { name: "Search articles" })
    .fill("no-results-7f5b1289");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(searchUrl);
  await expect(
    page.getByRole("main").getByText("No matching articles", { exact: true })
  ).toBeVisible();
  await page.reload();
  await expect(page.getByRole("searchbox")).toHaveValue("no-results-7f5b1289");
  await page.getByRole("link", { name: "Clear filters" }).click();
  await expect(page).toHaveURL(blogUrl);
  await expect(page.getByRole("searchbox")).toHaveValue("");
});

test("out-of-range pages keep filters while returning to a valid page", async ({
  page,
}) => {
  await openContentPage(
    page,
    "/en/blog?q=no-results-7f5b1289&tag=unknown-topic&page=9999"
  );
  await expect(page).toHaveURL(filteredUrl);
  await expect(
    page.getByRole("combobox", { name: "Topic", exact: true })
  ).toHaveValue("unknown-topic");
  await page.setViewportSize({ width: 320, height: 800 });
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    )
  ).toBeLessThanOrEqual(1);
});
