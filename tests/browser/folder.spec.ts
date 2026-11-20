import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { build } from "tsup";

let clientBundle: string;
let stylesheet: string;
let fixtureDirectory: string;
const browserDependencies = /.*/;
const projectUrl = /\/en\/projects\/one$/;

test.beforeAll(async () => {
  const requireWeb = createRequire(path.resolve("apps/web/package.json"));
  const tailwindPath = requireWeb.resolve("@tailwindcss/postcss");
  const postcss = createRequire(tailwindPath)("postcss");
  const tailwind = requireWeb("@tailwindcss/postcss");
  const stylePath = path.resolve("apps/web/app/(main)/[locale]/styles.css");
  stylesheet = (
    await postcss([tailwind()]).process(await readFile(stylePath, "utf8"), {
      from: stylePath,
    })
  ).css;
  fixtureDirectory = await mkdtemp(
    path.join(tmpdir(), "portfolio-folder-browser-")
  );
  await build({
    config: false,
    entry: {
      folder: path.resolve(
        "apps/web/__tests__/fixtures/folder-browser-client.tsx"
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
        ...options.define,
        "process.env": "{}",
        "process.env.NODE_ENV": '"production"',
      };
    },
    minify: true,
    silent: true,
  });
  clientBundle = await readFile(
    path.join(fixtureDirectory, "folder.js"),
    "utf8"
  );
});

test.afterAll(async () => {
  if (fixtureDirectory) {
    await rm(fixtureDirectory, { recursive: true, force: true });
  }
});

test("the registry folder opens, follows both themes, and preserves keyboard navigation without overflow", async ({
  page,
  isMobile,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setContent(
    `<!doctype html><html class="light"><head><base href="https://portfolio.test"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${stylesheet}</style></head><body class="portfolio-theme"><main id="folder-fixture"></main><button id="outside" style="position:absolute;top:16px;left:16px">Outside</button></body></html>`
  );
  await page.addScriptTag({ content: clientBundle });
  const trigger = page.getByRole("button", { name: "Selected work" });
  const folder = page.locator(".hero-folder-visual");
  expect(
    await folder.evaluate((element) => {
      const styles = getComputedStyle(element);
      return (
        styles.getPropertyValue("--folder-front-top").trim() ===
        styles.getPropertyValue("--color-amber-300").trim()
      );
    })
  ).toBe(true);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(folder.locator("[inert]")).toHaveCount(1);
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  const cards = folder.locator(".hero-folder-card");
  await expect(cards).toHaveCount(3);
  await expect(cards.first()).toBeVisible();
  await expect(folder.locator("[inert]")).toHaveCount(0);
  const folderBounds = await folder.boundingBox();
  await expect
    .poll(
      async () =>
        (await cards.first().boundingBox())?.y ?? Number.POSITIVE_INFINITY
    )
    .toBeLessThan((folderBounds?.y ?? 0) - (folderBounds?.height ?? 0) * 0.15);
  await expect(folder.locator(".react-bits-folder-items")).toHaveCSS(
    "display",
    "contents"
  );
  await expect(folder.locator("[data-folder-item]").first()).toHaveCSS(
    "position",
    "absolute"
  );
  if (isMobile) {
    const cardBounds = await cards.evaluateAll((elements) =>
      elements.map((element) => {
        const { x, width } = element.getBoundingClientRect();
        return { x, width };
      })
    );
    for (const bounds of cardBounds) {
      expect(bounds.width).toBeGreaterThan(0);
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(
        page.viewportSize()?.width ?? 0
      );
    }
  }
  await page.screenshot({
    path: testInfo.outputPath("folder-light.png"),
    fullPage: true,
  });
  const background = await cards
    .first()
    .evaluate(
      (element) =>
        getComputedStyle(element.parentElement as HTMLElement).backgroundColor
    );
  await page.evaluate(() => {
    document.documentElement.className = "dark";
  });
  expect(
    await folder.evaluate((element) => {
      const styles = getComputedStyle(element);
      return (
        styles.getPropertyValue("--folder-front-top").trim() ===
        styles.getPropertyValue("--color-amber-400").trim()
      );
    })
  ).toBe(true);
  await expect(cards.first().locator("..")).not.toHaveCSS(
    "background-color",
    background
  );
  await page.screenshot({
    path: testInfo.outputPath("folder-dark.png"),
    fullPage: true,
  });
  await cards.first().focus();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.keyboard.press("Space");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(cards.first()).toBeFocused();
  await page.route("**/en/projects/one", (route) =>
    route.fulfill({ contentType: "text/html", body: "Project reached" })
  );
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(projectUrl);
  expect(errors).toEqual([]);
});
