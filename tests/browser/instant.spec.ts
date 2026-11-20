import { readFile } from "node:fs/promises";
import { instant } from "@next/playwright";
import { expect, test } from "@playwright/test";

test.beforeAll(async () => {
  const { config } = JSON.parse(
    await readFile(
      new URL(
        "../../apps/web/.next/required-server-files.json",
        import.meta.url
      ),
      "utf8"
    )
  );
  expect(
    config.experimental.exposeTestingApiInProductionBuild,
    "Run pnpm test:instant to build with the navigation testing API."
  ).toBe(true);
});

test("direct visits render navigation before dynamic content", async ({
  page,
  baseURL,
}) => {
  await instant(
    page,
    async () => {
      await page.goto("/en/projects", { waitUntil: "commit" });
      await expect(page.getByRole("banner")).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    },
    { baseURL }
  );
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

for (const destination of ["blog", "projects"]) {
  test(`navigation to ${destination} shows its shell while dynamic data is paused`, async ({
    page,
    isMobile,
  }) => {
    await page.goto("/en");
    if (isMobile) {
      await page.getByRole("button", { name: "Toggle menu" }).click();
    }
    const navigation = isMobile
      ? page.getByRole("dialog", { name: "Main navigation" })
      : page.getByRole("banner");
    const link = navigation.getByRole("link", {
      name: destination === "blog" ? "Blog" : "Projects",
      exact: true,
    });
    await expect(link).toBeVisible();

    await instant(page, async () => {
      await link.click();
      await expect(page).toHaveURL(`/en/${destination}`);
      await expect(page.getByRole("banner")).toBeVisible();
      // Public CMS content should be prefetched, not just a blank transition.
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(
        page.getByRole("main").locator(`a[href^="/en/${destination}/"]`).first()
      ).toBeVisible();
    });
  });
}

for (const collection of ["blog", "projects"]) {
  test(`${collection} detail content is available during instant navigation`, async ({
    page,
  }) => {
    await page.goto(`/en/${collection}`);
    const link = page.locator(`a[href^="/en/${collection}/"]`).first();
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    const title = await link.getByRole("heading").textContent();
    expect(title).toBeTruthy();

    await instant(page, async () => {
      await link.click();
      await expect(page).toHaveURL(href as string);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        title?.trim() ?? ""
      );
    });
  });
}

for (const collection of ["blog", "projects", "legal"]) {
  test(`${collection} App Shell renders without URL-specific parameters`, async ({
    request,
  }) => {
    // Next.js 16.4's shell prefetch excludes URL data. A full per-link
    // prefetch resolves params, so it would miss a missing Suspense boundary.
    const response = await request.get(
      `/en/${collection}/__instant-shell-regression__`,
      { headers: { RSC: "1", "Next-Router-Prefetch": "3" } }
    );
    // The intentionally missing slug can carry 404 during its first static
    // generation; the shell must still contain the URL-independent fallback.
    expect([200, 404]).toContain(response.status());
    expect(response.headers()["content-type"]).toContain("text/x-component");
    expect(await response.text()).toContain("Loading content");
  });
}
