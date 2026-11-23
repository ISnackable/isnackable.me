// biome-ignore-all lint/performance/noAwaitInLoops: Reuse one graphics context and bound capture memory by processing frames sequentially.
import { createHash } from "node:crypto";
import {
  access,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import chromium from "@sparticuz/chromium";
import { chromium as playwright } from "playwright-core";
import sharp from "sharp";
import { build } from "tsup";
import { fingerprint, restoreCapture } from "./cache.mjs";
import { withDeadline } from "./deadline.mjs";
import { prepareInputs, readInputs } from "./inputs.mjs";

const FONT_FILE = /^[a-z0-9-]+\.woff2?$/;
async function packageVersion(name) {
  let location;
  try {
    location = require.resolve(`${name}/package.json`);
  } catch (error) {
    let directory = path.dirname(require.resolve(name));
    while (true) {
      try {
        const file = path.join(directory, "package.json");
        if (JSON.parse(await readFile(file, "utf8")).name === name) {
          location = file;
          break;
        }
      } catch {
        // Continue to the package root when an intermediate directory has no manifest.
      }
      const parent = path.dirname(directory);
      if (parent === directory) {
        throw new Error(`Cannot locate capture dependency ${name}`, {
          cause: error,
        });
      }
      directory = parent;
    }
  }
  return JSON.parse(await readFile(location, "utf8")).version;
}
const appRoot = fileURLToPath(new URL("../../", import.meta.url));
const require = createRequire(import.meta.url);
nextEnv.loadEnvConfig(appRoot, false);
const smoke = process.argv.includes("--smoke");
const manifestRoot = path.join(
  appRoot,
  smoke ? ".next/cache/lanyard-smoke" : "generated/lanyard"
);
const assetRoot = smoke
  ? path.join(manifestRoot, "assets")
  : path.join(appRoot, "public/assets/lanyard/generated");
await mkdir(manifestRoot, { recursive: true });
const staging = await mkdtemp(path.join(manifestRoot, ".capture-"));
let browser;
let server;

try {
  const expectedBrowser = require(
    path.join(
      path.dirname(require.resolve("playwright-core/package.json")),
      "browsers.json"
    )
  ).browsers.find((entry) => entry.name === "chromium").browserVersion;
  const expectedMajor = expectedBrowser.split(".")[0];
  const bundledBrowser = await packageVersion("@sparticuz/chromium");
  if (bundledBrowser.split(".")[0] !== expectedMajor) {
    throw new Error(
      `Lanyard capture dependencies need the same Chromium major. playwright-core expects ${expectedBrowser}, while @sparticuz/chromium bundles ${bundledBrowser}.`
    );
  }

  const options = {
    config: false,
    platform: "node",
    format: ["cjs"],
    splitting: false,
    target: "node22",
    tsconfig: path.join(appRoot, "tsconfig.json"),
    outDir: staging,
    outExtension: () => ({ js: ".cjs" }),
    silent: true,
    noExternal: [/^@repo\//],
  };
  await build({
    ...options,
    entry: {
      preset: path.join(
        appRoot,
        "app/(main)/[locale]/(home)/components/lanyard-preview.ts"
      ),
    },
  });
  const {
    LANYARD_HERO_FOV,
    LANYARD_PREVIEW_VERSION,
    LANYARD_PREVIEW_SIZES,
  } = require(path.join(staging, "preset.cjs"));
  const portrait = smoke
    ? `data:image/png;base64,${(
        await sharp({
          create: { width: 16, height: 16, channels: 4, background: "#bfa5ff" },
        })
          .png()
          .toBuffer()
      ).toString("base64")}`
    : undefined;
  const snapshot = smoke
    ? {
        inputs: [
          {
            key: "smoke",
            locale: "ja",
            portrait,
            dictionary: {
              badgeProfile: {
                name: "Capture 検証 测试",
                status: "Ready",
                pass: "BUILD",
                handle: "@smoke",
                summary: "Renderer smoke test",
                details: ["English", "日本語", "中文"],
              },
              cardBackProfile: {
                title: "Access Profile",
                subtitle: "Smoke test",
                description: "Renderer validation",
                footer: "Flip back",
              },
            },
          },
        ],
      }
    : process.env.TURBO_HASH
      ? await readInputs().catch(() => {
          throw new Error(
            "Prepare CMS inputs before starting Turbo: pnpm build (or pnpm --filter web lanyard:inputs first)."
          );
        })
      : await prepareInputs();
  const uniqueInputs = [
    ...new Map(snapshot.inputs.map((input) => [input.key, input])).values(),
  ];
  const sourceFiles = [
    "scripts/lanyard/generate.mjs",
    "scripts/lanyard-capture.ts",
    "app/(main)/[locale]/(home)/components/lanyard-renderer.ts",
    "app/(main)/[locale]/(home)/components/lanyard-content.ts",
    "app/(main)/[locale]/(home)/components/lanyard-preview.ts",
  ];
  const modules = [
    "three",
    "playwright-core",
    "@sparticuz/chromium",
    "sharp",
    "@fontsource/arimo",
    "@fontsource/noto-sans-jp",
    "@fontsource/noto-sans-sc",
  ];
  const captureKey = fingerprint({
    inputs: uniqueInputs.map(({ key, locale }) => ({ key, locale })),
    source: await Promise.all(
      sourceFiles.map((file) => readFile(path.join(appRoot, file), "utf8"))
    ),
    versions: await Promise.all(modules.map(packageVersion)),
    platform: process.platform,
    architecture: process.arch,
    browser: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? "default",
  });
  const cachedDirectory = path.join(
    appRoot,
    ".next/cache/lanyard-previews",
    captureKey
  );
  let manifest = { version: LANYARD_PREVIEW_VERSION, captureKey, previews: {} };
  const output = path.join(staging, "assets");
  await mkdir(output);

  const restored = smoke
    ? undefined
    : await restoreCapture(cachedDirectory, captureKey, output);
  if (restored) {
    manifest = restored;
  }
  if (!restored && uniqueInputs.length) {
    await build({
      ...options,
      platform: "browser",
      format: ["iife"],
      target: "es2022",
      outExtension: () => ({ js: ".mjs" }),
      entry: { capture: path.join(appRoot, "scripts/lanyard-capture.ts") },
      noExternal: [/.*/],
      minify: true,
    });
    const fonts = new Map(
      ["arimo", "noto-sans-jp", "noto-sans-sc"].map((font) => [
        font,
        path.dirname(require.resolve(`@fontsource/${font}/package.json`)),
      ])
    );
    const portraits = new Map(
      uniqueInputs
        .filter((input) => input.portrait)
        .map((input) => [input.key, input.portrait])
    );
    const portraitBytes = new Map();
    server = createServer(async (request, response) => {
      try {
        const url = new URL(request.url, "http://localhost");
        if (url.pathname === "/") {
          response.setHeader("Content-Type", "text/html; charset=utf-8");
          response.end(
            '<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:transparent}canvas{display:block}</style><canvas></canvas>'
          );
          return;
        }
        const [, kind, name, filename] = url.pathname.split("/");
        if (kind === "fonts" && fonts.has(name) && FONT_FILE.test(filename)) {
          response.setHeader("Content-Type", "font/woff2");
          response.end(
            await readFile(path.join(fonts.get(name), "files", filename))
          );
          return;
        }
        if (kind === "portrait" && portraits.has(name)) {
          if (!portraitBytes.has(name)) {
            const image = await fetch(portraits.get(name), {
              signal: AbortSignal.timeout(15_000),
            });
            if (!image.ok) {
              throw new Error(`Portrait download failed (${image.status})`);
            }
            portraitBytes.set(name, {
              type: image.headers.get("content-type"),
              bytes: Buffer.from(await image.arrayBuffer()),
            });
          }
          const image = portraitBytes.get(name);
          response.setHeader("Content-Type", image.type || "image/png");
          response.end(image.bytes);
          return;
        }
        response.writeHead(404).end();
      } catch (error) {
        response.writeHead(500).end(String(error));
      }
    });
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    const origin = `http://127.0.0.1:${server.address().port}`;
    const launchOptions = { headless: true };
    if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
      launchOptions.executablePath =
        process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
    } else if (process.platform === "linux") {
      launchOptions.executablePath = await chromium.executablePath();
      launchOptions.args = chromium.args;
    } else {
      const macChrome =
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
      try {
        await access(playwright.executablePath());
      } catch {
        await access(macChrome).catch(() => {
          throw new Error(
            "Install the capture browser with pnpm exec playwright install chromium, or set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH."
          );
        });
        launchOptions.executablePath = macChrome;
      }
    }
    launchOptions.args = [
      ...(launchOptions.args ?? []),
      "--enable-webgl",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ];
    browser = await playwright.launch(launchOptions);
    const actualBrowser = browser.version();
    if (
      process.platform === "linux" &&
      actualBrowser.split(".")[0] !== expectedMajor
    ) {
      throw new Error(
        `Lanyard capture launched Chromium ${actualBrowser}, while playwright-core expects ${expectedBrowser}. Update the capture dependencies together.`
      );
    }
    console.info(
      `Lanyard: capture browser ${actualBrowser} (${process.platform}/${process.arch}).`
    );
    const context = await browser.newContext({ deviceScaleFactor: 2 });
    const page = await context.newPage();
    page.setDefaultTimeout(30_000);
    await page.goto(origin);
    await page.addScriptTag({ path: path.join(staging, "capture.mjs") });

    for (const input of uniqueInputs) {
      const preview = {
        contentKey: input.key,
        desktop: { light: {}, dark: {} },
        mobile: { light: {}, dark: {} },
      };
      // Alias build-only fonts to Arial. Arimo has Arial-compatible Latin
      // metrics; Noto supplies CJK glyphs missing from headless Linux images.
      const families =
        input.locale === "ja"
          ? ["noto-sans-sc", "noto-sans-jp", "arimo"]
          : ["noto-sans-jp", "noto-sans-sc", "arimo"];
      let css = "";
      for (const family of families) {
        for (const weight of [400, 700]) {
          css += (
            await readFile(
              path.join(fonts.get(family), `${weight}.css`),
              "utf8"
            )
          )
            .replace(/font-family: '[^']+';/g, "font-family: 'Arial';")
            .replaceAll("url(./files/", `url(/fonts/${family}/`);
        }
      }
      await page.evaluate((fontCss) => {
        document.querySelector("#capture-fonts")?.remove();
        const style = document.createElement("style");
        style.id = "capture-fonts";
        style.textContent = fontCss;
        document.head.appendChild(style);
      }, css);
      const text = JSON.stringify(input.dictionary);
      await withDeadline(
        page.evaluate(async (value) => {
          await Promise.all(
            [400, 700].map((weight) =>
              document.fonts.load(`${weight} 24px Arial`, value)
            )
          );
          await document.fonts.ready;
        }, text),
        "Loading capture fonts"
      );
      for (const [layout, size] of Object.entries(LANYARD_PREVIEW_SIZES)) {
        await page.setViewportSize({
          width: Math.ceil(size.width),
          height: Math.ceil(size.height),
        });
        for (const theme of ["light", "dark"]) {
          for (const pose of ["entrance", "rest"]) {
            await withDeadline(
              page.evaluate(
                ({ configuration, size: dimensions }) =>
                  window.captureLanyard(configuration, dimensions),
                {
                  configuration: {
                    dictionary: input.dictionary,
                    avatarUrl: input.portrait
                      ? `${origin}/portrait/${input.key}`
                      : undefined,
                    fov: LANYARD_HERO_FOV,
                    isDark: theme === "dark",
                    reducedMotion: pose === "rest",
                  },
                  size,
                }
              ),
              `Preparing ${layout}/${theme}/${pose}`
            );
            const png = await page
              .locator("canvas")
              .screenshot({ omitBackground: true });
            const images = {};
            for (const pixelRatio of [1, 2]) {
              const image = await sharp(png)
                .resize({ width: Math.round(size.width * pixelRatio) })
                .webp({ lossless: true })
                .toBuffer();
              const hash = createHash("sha256")
                .update(image)
                .digest("hex")
                .slice(0, 16);
              const filename = `${input.key}-${layout}-${theme}-${pose}-${pixelRatio}x-${hash}.webp`;
              await writeFile(path.join(output, filename), image);
              images[pixelRatio === 1 ? "src" : "src2x"] =
                `/assets/lanyard/generated/${filename}`;
            }
            preview[layout][theme][pose] = images;
          }
        }
      }
      manifest.previews[input.key] = preview;
    }
  }
  if (!(restored || smoke)) {
    await mkdir(cachedDirectory, { recursive: true });
    await cp(output, path.join(cachedDirectory, "assets"), { recursive: true });
    await writeFile(
      path.join(cachedDirectory, "previews.json"),
      JSON.stringify(manifest)
    );
  }
  await writeFile(
    path.join(staging, "previews.json"),
    JSON.stringify(manifest)
  );
  await mkdir(path.dirname(assetRoot), { recursive: true });
  await rm(assetRoot, { recursive: true, force: true });
  await rename(output, assetRoot);
  await rename(
    path.join(staging, "previews.json"),
    path.join(manifestRoot, "previews.json")
  );
  console.info(
    `Lanyard: ${restored ? "reused" : "generated"} ${uniqueInputs.length * 16} preview images for ${uniqueInputs.length} unique badge(s).`
  );
} finally {
  await browser?.close();
  if (server) {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
  await rm(staging, { recursive: true, force: true });
}
