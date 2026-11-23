import { expect, test } from "@playwright/test";
import en from "../../packages/internationalization/messages/en.json" with {
  type: "json",
};
import ja from "../../packages/internationalization/messages/ja.json" with {
  type: "json",
};
import zh from "../../packages/internationalization/messages/zh.json" with {
  type: "json",
};
import { openContentPage } from "./content-page";

const dictionaries = { en, ja, zh };

const HTTP_URL = /^https?:\/\//;
const THEME_CLASS = /dark|light/;
const DARK_CLASS = /dark/;
const LIGHT_CLASS = /light/;
const JAPANESE_ROUTE = /\/ja$/;
const STUDIO_SCRIPT = /src="(\/studio\/static\/[^"]+\.js)"/;
const JAVASCRIPT_CONTENT_TYPE = /javascript/;

for (const locale of ["en", "ja", "zh"] as const) {
  test(`homepage renders and hydrates in ${locale}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(`/${locale}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.locator(`header a[href="/${locale}/blog"]`)).toHaveCount(
      1
    );
    await expect(
      page.locator(`header a[href="/${locale}/projects"]`)
    ).toHaveCount(1);
    await page
      .getByRole("button", {
        name: dictionaries[locale].common.header.toggleTheme,
      })
      .click();
    await expect(page.locator("html")).toHaveClass(THEME_CLASS);
    expect(errors).toEqual([]);
  });
}

test("theme selection persists after reload", async ({ page }) => {
  await page.goto("/en");
  const root = page.locator("html");
  await expect(root).toHaveClass(THEME_CLASS);
  const wasDark = await root.evaluate((element) =>
    element.classList.contains("dark")
  );
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(root).toHaveClass(wasDark ? LIGHT_CLASS : DARK_CLASS);
  await page.reload();
  await expect(root).toHaveClass(wasDark ? LIGHT_CLASS : DARK_CLASS);
});

test("homepage content remains readable with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openContentPage(page, "/en");
  const sections = page.locator(".section-reveal");
  test.skip(
    (await sections.count()) === 0,
    "Add a content section to the Home page builder to exercise reveal styling."
  );
  for (const section of await sections.all()) {
    // biome-ignore lint/performance/noAwaitInLoops: Check each section's final accessible state.
    await expect(section).toHaveCSS("opacity", "1");
    await expect(section).toHaveCSS("transform", "none");
  }
  const signature = page.locator("#canvas[role='img']");
  if (await signature.count()) {
    await expect(signature.locator(":scope > g")).toHaveCSS(
      "mask-image",
      "none"
    );
    for (const stroke of await signature.locator(":scope > path").all()) {
      // biome-ignore lint/performance/noAwaitInLoops: Every tracing stroke must be hidden under reduced motion.
      await expect(stroke).toHaveCSS("display", "none");
    }
  }
});

test("language switcher changes the route and page language", async ({
  page,
}) => {
  await page.goto("/en");
  await page.getByRole("button", { name: "Switch language" }).click();
  await page.getByRole("menuitem", { name: "日本語" }).click();
  await expect(page).toHaveURL(JAPANESE_ROUTE);
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  await expect(page.locator('header a[href="/ja/blog"]')).toHaveCount(1);
});

test("content indexes and resume render successfully", async ({ page }) => {
  for (const route of ["/en/blog", "/en/projects", "/en/resume"]) {
    // biome-ignore lint/performance/noAwaitInLoops: Each navigation uses the same browser page.
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.getByRole("heading").first()).toBeVisible();
  }
});

test("project showcases keep their cover visible beside desktop copy and above mobile copy", async ({
  page,
  isMobile,
}) => {
  await openContentPage(page, "/en/projects");
  const card = page.locator('a[href^="/en/projects/"]').first();
  test.skip(
    (await card.count()) === 0,
    "Publish a project to exercise its showcase."
  );
  const image = card.locator(".content-image");
  const heading = card.getByRole("heading");
  await expect(image).toBeVisible();
  const imageBounds = await image.boundingBox();
  const headingBounds = await heading.boundingBox();
  expect(imageBounds).not.toBeNull();
  expect(headingBounds).not.toBeNull();
  expect(imageBounds?.width).toBeGreaterThan(150);
  if (isMobile) {
    expect(imageBounds?.y).toBeLessThan(headingBounds?.y ?? 0);
  } else {
    expect(imageBounds?.x).toBeGreaterThan(headingBounds?.x ?? 0);
  }
});

test("unknown article URLs return a real 404", async ({ request }) => {
  for (const type of ["blog", "projects", "legal"]) {
    // biome-ignore lint/performance/noAwaitInLoops: Verify each collection's response independently.
    const response = await request.get(
      `/en/${type}/__upgrade-regression-missing__`
    );
    expect(response.status(), type).toBe(404);
  }
});

test("an unmatched portfolio URL offers localized keyboard recovery", async ({
  page,
}) => {
  const response = await page.goto("/ja/missing-portfolio-page");
  expect(response?.status()).toBe(404);
  const heading = page.getByRole("heading", { name: "ページが見つかりません" });
  const home = page.getByRole("link", { name: "ホームに戻る" });

  await expect(heading).toBeFocused();
  await expect(home).toHaveAttribute("href", "/ja");
  await page.keyboard.press("Tab");
  await expect(home).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("/ja");
});

for (const collection of ["blog", "projects"]) {
  test(`homepage ${collection} links open full pages and support browser back`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await openContentPage(page, "/en");
    const article =
      collection === "blog"
        ? page
            .locator('main a[href^="/en/blog/"]')
            .filter({ has: page.getByRole("heading", { level: 3 }) })
            .first()
        : page
            .getByRole("region", { name: "Project preview" })
            .getByRole("link", { name: "Explore project", exact: true });
    test.skip(
      (await article.count()) === 0,
      `Include published ${collection} content in Home to exercise homepage links.`
    );
    await expect(article).toBeVisible();
    const href = await article.getAttribute("href");
    const title =
      collection === "blog"
        ? await article.getByRole("heading").textContent()
        : await page.locator("[data-preview-title]").textContent();
    expect(href).toBeTruthy();
    await article.click();
    await expect(page).toHaveURL(href as string);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      title?.trim() ?? ""
    );
    await expect(page.locator("[data-article-body]")).toHaveCSS(
      "line-height",
      "33.25px"
    );
    await page.goBack();
    await expect(page).toHaveURL("/en");
    await expect(article).toBeVisible();
    await expect(article).toHaveAttribute("href", href as string);
    expect(errors).toEqual([]);
  });
}

for (const path of ["/studio", "/studio/presentation"]) {
  test(`Studio serves its shell and scripts at ${path}`, async ({
    request,
  }) => {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain("noindex");
    const script = html.match(STUDIO_SCRIPT)?.[1] ?? "";
    expect(script).toBeTruthy();
    const asset = await request.get(script);
    expect(asset.status()).toBe(200);
    expect(asset.headers()["content-type"]).toMatch(JAVASCRIPT_CONTENT_TYPE);
  });
}

test.describe("portfolio sharing metadata", () => {
  for (const path of ["/en", "/en/blog", "/en/projects"]) {
    test(`${path} declares a canonical URL and share image`, async ({
      page,
    }) => {
      const documentResponse = await page.goto(path);
      expect(documentResponse?.status()).toBe(200);
      const head = (await documentResponse?.text())?.split("</head>", 1)[0];
      expect(head).not.toContain('property="twitter:card"');
      expect(head).toContain(
        'name="twitter:card" content="summary_large_image"'
      );

      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute("href", HTTP_URL);
      expect(
        new URL((await canonical.getAttribute("href")) ?? "").pathname
      ).toBe(path);

      const imageTag = page.locator('meta[property="og:image"]');
      await expect(imageTag).toHaveCount(1);
      await expect(imageTag).toHaveAttribute("content", HTTP_URL);
      const image = (await imageTag.getAttribute("content")) ?? "";
      await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
        "content",
        image
      );

      const { pathname, search } = new URL(image);
      if (pathname.startsWith(`${path}/opengraph-image`)) {
        const response = await page.request.get(`${pathname}${search}`);
        expect(response.status()).toBe(200);
        expect(response.headers()["content-type"]).toBe("image/png");
      }
    });
  }
});

test("robots and sitemap expose valid site URLs", async ({ request }) => {
  for (const route of ["/robots.txt", "/sitemap.xml"]) {
    // biome-ignore lint/performance/noAwaitInLoops: Keep smoke checks serial and easy to diagnose.
    const response = await request.get(route);
    expect(response.status()).toBe(200);
    expect(await response.text()).not.toContain("https://http");
    expect(await response.text()).not.toContain("undefined");
  }
});
