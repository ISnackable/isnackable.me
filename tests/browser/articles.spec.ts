import { expect, test } from "@playwright/test";
import { openContentPage } from "./content-page";

const nonWhitespace = /\S/;

test("article prose is readable before application scripts load or the reader scrolls", async ({
  page,
}) => {
  await openContentPage(page, "/en/blog");
  const link = page.locator('main a[href^="/en/blog/"]').first();
  test.skip(
    (await link.count()) === 0,
    "Publish an article to check its text."
  );
  const href = await link.getAttribute("href");
  expect(href).toBeTruthy();
  await page.route("**/_next/static/**/*.js", (route) => route.abort());
  const response = await page.goto(href as string);
  expect(response?.status()).toBe(200);
  await expect(page.locator("main h1")).toBeVisible();
  const paragraphs = page
    .locator("[data-article-body] p")
    .filter({ hasText: nonWhitespace });
  test.skip((await paragraphs.count()) === 0, "The article has no paragraphs.");
  await expect(paragraphs.first()).toBeVisible();
  await expect(paragraphs.last()).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

for (const collection of ["blog", "projects"]) {
  for (const theme of ["light", "dark"] as const) {
    test(`${collection} articles remain readable in ${theme} mode`, async ({
      page,
      isMobile,
    }) => {
      await page.addInitScript((value) => {
        localStorage.setItem("theme", value);
      }, theme);
      await openContentPage(page, `/en/${collection}`);
      const articleLink = page
        .locator(`main a[href^="/en/${collection}/"]`)
        .first();
      test.skip(
        (await articleLink.count()) === 0,
        `Publish a ${collection} document to exercise article styling.`
      );
      const href = await articleLink.getAttribute("href");
      expect(href).toBeTruthy();
      await page.goto(href as string);

      const article = page.locator("main article");
      const body = article.locator("[data-article-body]");
      const metadata = article.locator("[data-article-meta]");
      await expect(metadata).toBeVisible();
      await expect(body).toHaveCSS("font-size", "19px");
      await expect(body).toHaveCSS("line-height", "33.25px");
      await expect(article.getByRole("heading", { level: 1 })).toHaveCount(1);

      const contrast = await article.evaluate((element) => {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) {
          throw new Error("Canvas is required to resolve browser theme colors");
        }
        function luminance(color: string) {
          if (!context) {
            throw new Error("Canvas context is unavailable");
          }
          context.fillStyle = color;
          context.fillRect(0, 0, 1, 1);
          const channels = context.getImageData(0, 0, 1, 1).data;
          return [0.2126, 0.7152, 0.0722].reduce((sum, weight, index) => {
            const channel = channels[index] / 255;
            const linear =
              channel <= 0.040_45
                ? channel / 12.92
                : ((channel + 0.055) / 1.055) ** 2.4;
            return sum + linear * weight;
          }, 0);
        }
        const background = luminance(
          getComputedStyle(document.body).backgroundColor
        );
        return ["[data-article-body]", "[data-article-meta]"].map(
          (selector) => {
            const target = element.querySelector(selector);
            if (!target) {
              throw new Error(`Missing article element: ${selector}`);
            }
            const foreground = luminance(getComputedStyle(target).color);
            return (
              (Math.max(background, foreground) + 0.05) /
              (Math.min(background, foreground) + 0.05)
            );
          }
        );
      });
      for (const ratio of contrast) {
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }

      const alignment = await article.evaluate((element) => {
        const header = element.querySelector("header")?.getBoundingClientRect();
        const text = element
          .querySelector("[data-article-body]")
          ?.getBoundingClientRect();
        return Math.abs((header?.left ?? 0) - (text?.left ?? 0));
      });
      if (collection === "blog") {
        expect(alignment).toBeLessThanOrEqual(1);
      }
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth
        )
      ).toBeLessThanOrEqual(1);

      if (collection === "blog" && !isMobile) {
        const link = page
          .getByRole("navigation", { name: "On this page" })
          .getByRole("link")
          .first();
        if (await link.count()) {
          const anchor = await link.getAttribute("href");
          await page.addStyleTag({
            content: "html { scroll-behavior: auto !important; }",
          });
          await link.click();
          const heading = page.locator(anchor as string);
          await expect(heading).toHaveAccessibleName(
            (await link.textContent())?.trim() ?? ""
          );
          await expect(heading).toHaveCSS("scroll-margin-top", "96px");
          expect(
            await heading.evaluate(
              (element) => element.getBoundingClientRect().top
            )
          ).toBeGreaterThanOrEqual(56);
        }
      }

      await page.setViewportSize({ width: 320, height: 800 });
      await expect(metadata).toBeVisible();
      await page.addStyleTag({
        content: `
          html { font-size: 200%; }
          main article * {
            line-height: 1.5 !important;
            letter-spacing: 0.12em !important;
            word-spacing: 0.16em !important;
          }
          main article p { margin-bottom: 2em !important; }
        `,
      });
      await expect(body).toHaveCSS("font-size", "38px");
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth
        )
      ).toBeLessThanOrEqual(1);
      await expect(metadata).toBeVisible();
    });
  }
}
