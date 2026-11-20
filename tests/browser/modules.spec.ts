import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { build } from "tsup";
import { codeFixture, moduleFixtures } from "../fixtures/cms-modules";

let clientBundle: string;
let fixtureDirectory: string;
let renderModuleBrowserContent: typeof import("../../apps/web/__tests__/fixtures/module-browser-content").renderModuleBrowserContent;
const browserDependencies = /.*/;
const serverDependencies =
  /^(?!(?:node:|react(?:\/|$)|react-dom(?:\/|$)|next(?:\/|$))).*/;

test.beforeAll(async () => {
  const cacheDirectory = path.resolve("apps/web/.next/cache");
  await mkdir(cacheDirectory, { recursive: true });
  fixtureDirectory = await mkdtemp(
    path.join(cacheDirectory, "module-browser-")
  );
  await build({
    config: false,
    entry: {
      modules: path.resolve(
        "apps/web/__tests__/fixtures/module-browser-client.tsx"
      ),
    },
    outDir: fixtureDirectory,
    outExtension: () => ({ js: ".js" }),
    format: ["iife"],
    platform: "browser",
    target: "es2022",
    tsconfig: "apps/web/tsconfig.json",
    noExternal: [browserDependencies],
    esbuildOptions: (options) => {
      options.jsx = "automatic";
      options.define = {
        "process.env": JSON.stringify({ NODE_ENV: "production" }),
      };
    },
    minify: true,
    silent: true,
  });
  clientBundle = await readFile(
    path.join(fixtureDirectory, "modules.js"),
    "utf8"
  );
  // Shared packages are raw TS: bundle aliases/dynamic imports as Next does.
  // Keep React and Next external, resolved through apps/web/node_modules.
  await build({
    config: false,
    entry: {
      render: path.resolve(
        "apps/web/__tests__/fixtures/module-browser-content.ts"
      ),
    },
    outDir: fixtureDirectory,
    outExtension: () => ({ js: ".cjs" }),
    format: ["cjs"],
    platform: "node",
    target: "node22",
    tsconfig: "apps/web/tsconfig.json",
    noExternal: [serverDependencies],
    external: ["react", "react-dom", "next"],
    splitting: false,
    esbuildOptions: (options) => {
      options.jsx = "automatic";
    },
    silent: true,
  });
  ({ renderModuleBrowserContent } = createRequire(import.meta.url)(
    path.join(fixtureDirectory, "render.cjs")
  ));
});

test.afterAll(async () => {
  if (fixtureDirectory) {
    await rm(fixtureDirectory, { recursive: true, force: true });
  }
});

test("shared modules use theme defaults, stable anchors, and keyboard accordions", async ({
  page,
  baseURL,
  isMobile,
}, testInfo) => {
  await page.goto("/en/blog");
  const stylesheets = await page
    .locator('link[rel="stylesheet"]')
    .evaluateAll((links) =>
      links.map((link) => (link as HTMLLinkElement).href)
    );
  const content = await renderModuleBrowserContent(moduleFixtures, codeFixture);
  const fixtureUrl = new URL("/__module-fixture__", baseURL).href;
  await page.route(fixtureUrl, (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: `<!doctype html><html class="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${stylesheets.map((href) => `<link rel="stylesheet" href="${href}">`).join("")}</head><body class="portfolio-theme"><main style="max-width: 800px; padding: 24px; margin: auto">${content}</main></body></html>`,
    })
  );
  await page.goto(fixtureUrl);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const module = page.locator("#reader-note");
  await expect(module).toHaveCSS("scroll-margin-top", "96px");
  await expect(module.locator('[data-slot="alert"]')).not.toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)"
  );
  const gallery = page.locator("[data-gallery]");
  await expect(gallery).toHaveCSS("display", "grid");
  expect(
    await gallery.evaluate(
      (element) =>
        getComputedStyle(element).gridTemplateColumns.split(" ").length
    )
  ).toBe(isMobile ? 1 : 3);
  await expect(page.locator("#article-modules [data-module]")).toHaveCount(2);
  const code = page.locator('#code-fixture [data-slot="code-block-content"]');
  await expect(code).toContainText('const greeting = "<script>";');
  await expect(code.locator("script")).toHaveCount(0);

  await page.addScriptTag({ content: clientBundle });
  await expect(code.locator("span[style]").first()).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: (text: string) => {
          document.documentElement.dataset.copiedCode = text;
          return Promise.resolve();
        },
      },
    });
  });
  await page.getByRole("button", { name: "Copy", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-copied-code",
    codeFixture.code
  );
  await expect(
    page.getByRole("button", { name: "Copied", exact: true })
  ).toBeVisible();
  const trigger = page.getByRole("button", { name: "How does it work?" });
  await expect(trigger).toHaveAttribute("data-index", "0");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByText("The complete explanation.", { exact: true })
  ).toBeVisible();
  await expect
    .poll(() =>
      page.locator('[data-slot="accordion-content"]').evaluate((panel) => {
        const text = panel.querySelector("p")?.getBoundingClientRect();
        const bounds = panel.getBoundingClientRect();
        return Boolean(
          text && bounds.height > 0 && bounds.bottom >= text.bottom - 1
        );
      })
    )
    .toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("modules-light.png"),
    fullPage: true,
  });
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByText("The complete explanation.", { exact: true })
  ).toBeHidden();

  const lightBackground = await module
    .locator('[data-slot="alert"]')
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  await page.evaluate(() => {
    document.documentElement.className = "dark";
    document.documentElement.style.colorScheme = "dark";
  });
  await expect(module.locator('[data-slot="alert"]')).not.toHaveCSS(
    "background-color",
    lightBackground
  );
  await expect(trigger).toHaveCSS(
    "color",
    await page
      .locator("#article-modules")
      .evaluate((element) => getComputedStyle(element).color)
  );
  await page.screenshot({
    path: testInfo.outputPath("modules-dark.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 320, height: 800 });
  expect(
    await gallery.evaluate(
      (element) =>
        getComputedStyle(element).gridTemplateColumns.split(" ").length
    )
  ).toBe(1);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    )
  ).toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
});
