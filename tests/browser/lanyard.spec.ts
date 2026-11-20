import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, type Locator, type Page, test } from "@playwright/test";
import { build, type Options } from "tsup";
import {
  fixtureDictionary,
  fixturePortrait,
} from "../../apps/web/__tests__/fixtures/lanyard-data";
import {
  LANYARD_PREVIEW_SIZES,
  type LanyardPreview,
} from "../../apps/web/app/(main)/[locale]/(home)/components/lanyard-preview";

let clientBundle: string;
let workerBundle: string;
let clientStyles: string;
let fixturePreview: LanyardPreview;
const previewImages = new Map<string, Buffer>();
let fixtureDirectory: string;
const PORTRAIT_IMAGE = fixturePortrait.split(",")[1];
const browserDependencies = /.*/;
const LANYARD_FILE = /\/lanyard\.tsx$/;
const RENDERER_FILE = /\/lanyard-renderer\.ts$/;
const ORIGINAL_TEXT = /Alex.*Access Profile/;
const UPDATED_TEXT = /Updated identity.*Updated back/;

test.beforeAll(async ({ browser }) => {
  fixtureDirectory = await mkdtemp(path.join(tmpdir(), "lanyard-browser-"));
  const options: Options = {
    config: false,
    outDir: fixtureDirectory,
    outExtension: () => ({ js: ".js" }),
    format: ["iife"],
    platform: "browser",
    target: "es2022",
    tsconfig: "apps/web/tsconfig.json",
    noExternal: [browserDependencies],
    esbuildOptions(esbuild) {
      esbuild.jsx = "automatic";
      esbuild.define = {
        "process.env": "{}",
        "process.env.NODE_ENV": '"production"',
      };
    },
    esbuildPlugins: [
      {
        name: "renderer-diagnostics",
        setup(bundler) {
          bundler.onLoad({ filter: RENDERER_FILE }, async ({ path: file }) => ({
            contents: (await readFile(file, "utf8"))
              .replace(
                "await renderer.compileAsync(scene, camera);",
                "await new Promise(resolve => setTimeout(resolve, globalThis.__fixtureStartupDelay || 0));await renderer.compileAsync(scene, camera);"
              )
              .replace(
                "const response = await fetch(url, { signal });",
                'if (url.endsWith("/stalled.png")) await new Promise(() => {});const response = await fetch(url, { signal });'
              )
              .replace(
                'emit({ type: "ready", revision });',
                `emit({type:"fixture-metrics", data:{
              bodyY: sim.body.position.y,
              calls: renderer.info.render.calls,
              triangles: renderer.info.render.triangles,
              geometries: renderer.info.memory.geometries,
              textures: renderer.info.memory.textures,
              faceWidth: frontCanvas.width,
              faceHeight: frontCanvas.height,
              pixelRatio: renderer.getPixelRatio(),
              antialias: renderer.getContext().getContextAttributes()?.antialias,
              graphicsRenderer: renderer.getContext().getParameter(renderer.getContext().getExtension("WEBGL_debug_renderer_info")?.UNMASKED_RENDERER_WEBGL || renderer.getContext().RENDERER),
            }});emit({type:"ready",revision});`
              )
              .replace(
                "released = true;",
                'emit({type:"fixture-release",y:sim.body.position.y});released = true;'
              )
              .replace(
                "const dt = Math.min(1 / 30, Math.max(0, (now - last) / 1000));",
                "const dt=globalThis.__fixtureFrameJitter?[16.3,17.2,15.5,18,16.8][globalThis.__fixtureJitterIndex++%5]/1000:Math.min(1/30,Math.max(0,(now-last)/1000));"
              )
              .replace(
                "const resting = sim.calm > 1.2 && current.breeze === 0;",
                'const resting = sim.calm > 1.2 && current.breeze === 0;if(resting){emit({type:"fixture-sleep"});}if(time > 1.5 && !globalThis.__fixturePoseCaptured){globalThis.__fixturePoseCaptured=true;emit({type:"fixture-pose",y:sim.body.position.y});}'
              ),
            loader: "ts",
          }));
        },
      },
    ],
    minify: true,
    silent: true,
  };
  await build({
    ...options,
    entry: {
      worker: path.resolve(
        "apps/web/app/(main)/[locale]/(home)/components/lanyard.worker.ts"
      ),
    },
  });
  await build({
    ...options,
    entry: {
      capture: path.resolve("apps/web/scripts/lanyard-capture.ts"),
    },
  });
  await build({
    ...options,
    loader: { ".css": "local-css" },
    entry: {
      lanyard: path.resolve(
        "apps/web/__tests__/fixtures/lanyard-browser-client.tsx"
      ),
    },
    esbuildPlugins: [
      {
        name: "fixture-renderer-urls",
        setup(bundler) {
          bundler.onLoad({ filter: LANYARD_FILE }, async ({ path: file }) => ({
            contents: (await readFile(file, "utf8")).replace(
              'new URL("./lanyard.worker.ts", import.meta.url)',
              "globalThis.__lanyardWorkerUrl"
            ),
            loader: "tsx",
          }));
        },
      },
    ],
  });
  clientStyles = await readFile(
    path.join(fixtureDirectory, "lanyard.css"),
    "utf8"
  );
  fixturePreview = {
    contentKey: "fixture",
    desktop: {
      light: {
        entrance: { src: "", src2x: "" },
        rest: { src: "", src2x: "" },
      },
      dark: {
        entrance: { src: "", src2x: "" },
        rest: { src: "", src2x: "" },
      },
    },
    mobile: {
      light: {
        entrance: { src: "", src2x: "" },
        rest: { src: "", src2x: "" },
      },
      dark: {
        entrance: { src: "", src2x: "" },
        rest: { src: "", src2x: "" },
      },
    },
  };
  const context = await browser.newContext({ deviceScaleFactor: 2 });
  const capture = await context.newPage();
  await capture.setContent(
    "<style>body{margin:0;background:transparent}canvas{display:block}</style><canvas></canvas>"
  );
  await capture.addScriptTag({
    path: path.join(fixtureDirectory, "capture.js"),
  });
  for (const [layout, size] of Object.entries(LANYARD_PREVIEW_SIZES)) {
    // biome-ignore lint/performance/noAwaitInLoops: Capture the same held renderer sequentially.
    await capture.setViewportSize({
      width: Math.ceil(size.width),
      height: Math.ceil(size.height),
    });
    for (const theme of ["light", "dark"] as const) {
      for (const pose of ["entrance", "rest"] as const) {
        // biome-ignore lint/performance/noAwaitInLoops: Each capture must follow its configuration.
        await capture.evaluate(
          ({ configuration, dimensions }) =>
            window.captureLanyard(configuration, dimensions),
          {
            configuration: {
              dictionary: fixtureDictionary,
              fov: 11,
              isDark: theme === "dark",
              reducedMotion: pose === "rest",
            },
            dimensions: size,
          }
        );
        for (const pixelRatio of [1, 2]) {
          // biome-ignore lint/performance/noAwaitInLoops: Capture both resolutions of the same held frame.
          const image = await capture.locator("canvas").screenshot({
            omitBackground: true,
            scale: pixelRatio === 1 ? "css" : "device",
          });
          const url = `https://lanyard.test/previews/${layout}-${theme}-${pose}-${pixelRatio}x.png`;
          previewImages.set(url, image);
          fixturePreview[layout as "desktop" | "mobile"][theme][pose][
            pixelRatio === 1 ? "src" : "src2x"
          ] = url;
        }
      }
    }
  }
  await context.close();
  workerBundle = await readFile(
    path.join(fixtureDirectory, "worker.js"),
    "utf8"
  );
  clientBundle = await readFile(
    path.join(fixtureDirectory, "lanyard.js"),
    "utf8"
  );
});

test.afterAll(async () => {
  if (fixtureDirectory) {
    await rm(fixtureDirectory, { recursive: true, force: true });
  }
});

// Read the area occupied by the back title. It is blank on the front, so this
// verifies the actual rendered side rather than just observing pointer events.
async function renderedCard(canvas: Locator) {
  const png = (await canvas.screenshot({ omitBackground: true })).toString(
    "base64"
  );
  return canvas.evaluate(
    async (element, { data }) => {
      const image = new Image();
      image.src = `data:image/png;base64,${data}`;
      await image.decode();
      const sample = document.createElement("canvas");
      sample.width = image.width;
      sample.height = image.height;
      const ctx = sample.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas 2D is unavailable");
      }
      ctx.drawImage(image, 0, 0);
      const height = element.clientHeight;
      const viewHeight = 60 * Math.tan((11 * Math.PI) / 360);
      const cardHeight = (2.25 / viewHeight) * height;
      const cardWidth = (1.611_940_3 / viewHeight) * height;
      const left = (element.clientWidth - cardWidth) / 2;
      const compact = element.getBoundingClientRect().width < 320;
      const top = height * (compact ? 0.047 : 0.36) + height * 0.01;
      const scale = image.width / element.clientWidth;
      const pixels = ctx.getImageData(
        Math.round((left + cardWidth * 0.1) * scale),
        Math.round((top + cardHeight * 0.14) * scale),
        Math.round(cardWidth * 0.58 * scale),
        Math.round(cardHeight * 0.13 * scale)
      ).data;
      const dark = document.documentElement.classList.contains("dark");
      let ink = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        if (
          (dark ? pixels[index] > 160 : pixels[index] < 180) &&
          Math.abs(pixels[index] - pixels[index + 1]) < 20
        ) {
          ink++;
        }
      }
      const full = ctx.getImageData(0, 0, image.width, image.height).data;
      const row = Math.round((top + cardHeight * 0.5) * scale);
      const column = Math.round((left + cardWidth * 0.25) * scale);
      const xs: number[] = [];
      const ys: number[] = [];
      for (let x = 0; x < image.width; x++) {
        if (full[(row * image.width + x) * 4 + 3] > 128) {
          xs.push(x);
        }
      }
      for (let y = 0; y < image.height; y++) {
        if (full[(y * image.width + column) * 4 + 3] > 128) {
          ys.push(y);
        }
      }
      const pill = ctx.getImageData(
        Math.round((left + cardWidth * (95 / 716)) * scale),
        Math.round((top + cardHeight * 0.735) * scale),
        1,
        1
      ).data;
      const avatar = ctx.getImageData(
        Math.round((left + cardWidth * (178 / 716)) * scale),
        Math.round((top + cardHeight * 0.243) * scale),
        1,
        1
      ).data;
      return {
        ink,
        avatar: Array.from(avatar.slice(0, 3)),
        pill: Array.from(pill.slice(0, 3)),
        left: xs[0] / scale,
        top: ys[0] / scale,
        width: ((xs.at(-1) ?? 0) - xs[0] + 1) / scale,
        height: ((ys.at(-1) ?? 0) - ys[0] + 1) / scale,
      };
    },
    { data: png }
  );
}

async function titleInk(canvas: Locator) {
  return (await renderedCard(canvas)).ink;
}

async function mountFixture(
  page: Page,
  isMobile: boolean,
  {
    failWorker = false,
    captureText = true,
    withPreview = false,
    startupDelay = 0,
    reducedMotion = true,
    initialPortrait,
    portraitDelay = 0,
    portraitError = false,
    frameJitter = false,
  }: {
    failWorker?: boolean;
    captureText?: boolean;
    withPreview?: boolean;
    startupDelay?: number;
    reducedMotion?: boolean;
    initialPortrait?: string;
    portraitDelay?: number;
    portraitError?: boolean;
    frameJitter?: boolean;
  } = {}
) {
  await page.context().route("https://lanyard.test/**", async (route) => {
    if (route.request().url() === "https://lanyard.test/portrait.png") {
      await new Promise((resolve) => setTimeout(resolve, portraitDelay));
      return route.fulfill({
        status: portraitError ? 500 : 200,
        contentType: "image/png",
        body: Buffer.from(PORTRAIT_IMAGE, "base64"),
      });
    }
    const image = previewImages.get(route.request().url());
    return route.fulfill(
      image
        ? { contentType: "image/png", body: image }
        : {
            contentType: "text/html",
            body: '<!doctype html><link rel="icon" href="data:,">',
          }
    );
  });
  await page.goto("https://lanyard.test/");
  await page.emulateMedia({
    reducedMotion: reducedMotion ? "reduce" : "no-preference",
  });
  const width = isMobile ? 250 : 360;
  const height = isMobile ? 360 : 820;
  await page.setContent(`<!doctype html><html style="touch-action:manipulation"><head><meta charset="utf-8"><link rel="icon" href="data:,">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>body{margin:0;background:transparent}nav{min-height:40px;display:flex;flex-wrap:wrap}
    .lanyard-host{width:${width}px;height:${height}px;transform:scale(${isMobile ? 1.38 : 1});transform-origin:top left}
    ${clientStyles}
    .lanyard-wrapper{height:100%!important}canvas{display:block;width:100%;height:100%}</style>
    </head><body><button id="startup-action" style="position:fixed;right:0;bottom:0" onclick="this.textContent='Clicked'">Outside control</button><div id="lanyard-fixture"></div></body></html>`);
  // Initialize Playwright's injected selector/actionability engine before the
  // worker heartbeat. Its first compilation under CPU throttling is test
  // tooling, not lanyard startup, and otherwise contaminates this measurement.
  await page.locator("#startup-action").click({ trial: true });
  await page.evaluate(
    ({
      source,
      preview,
      startupDelay: delay,
      frameJitter: jitter,
      initialPortrait: avatar,
      failWorker: unavailable,
      captureText: observeText,
    }) => {
      const prefix = observeText
        ? `const fillText = OffscreenCanvasRenderingContext2D.prototype.fillText;
      OffscreenCanvasRenderingContext2D.prototype.fillText = function(text, ...args) {
        postMessage({type:"fixture-text", text, color:String(this.fillStyle)});
        return fillText.call(this, text, ...args);
      };`
        : "";
      const url = URL.createObjectURL(
        new Blob(
          [
            `globalThis.__fixtureStartupDelay=${delay};globalThis.__fixtureFrameJitter=${jitter};globalThis.__fixtureJitterIndex=0;`,
            prefix,
            source,
          ],
          { type: "text/javascript" }
        )
      );
      Object.assign(globalThis, {
        __lanyardWorkerUrl: url,
        __lanyardPreview: preview,
        __lanyardInitialPortrait: avatar,
      });
      if (!observeText) {
        new PerformanceObserver((list) => {
          document.body.dataset.longTasks = JSON.stringify([
            ...JSON.parse(document.body.dataset.longTasks ?? "[]"),
            ...list.getEntries().map((entry) => ({
              start: entry.startTime,
              duration: entry.duration,
              name: entry.name,
            })),
          ]);
        }).observe({ type: "longtask", buffered: true });
      }
      const OriginalWorker = window.Worker;
      window.Worker = class extends OriginalWorker {
        constructor(script: string | URL, options?: WorkerOptions) {
          if (unavailable) {
            throw new Error("Worker unavailable in this fixture");
          }
          const began = performance.now();
          let previous = began;
          let maximum = 0;
          let completed = false;
          let heartbeat = 0;
          const beat = () => {
            const now = performance.now();
            if (now - previous > maximum) {
              maximum = now - previous;
              document.body.dataset.gapStart = String(previous);
              document.body.dataset.gapEnd = String(now);
            }
            previous = now;
            if (!completed) {
              heartbeat = requestAnimationFrame(beat);
            }
          };
          heartbeat = requestAnimationFrame(beat);
          super(script, options);
          document.body.dataset.workerBegan = String(began);
          document.body.dataset.workerConstructed = String(performance.now());
          document.body.dataset.workerStarted = "true";
          document.body.dataset.workerCount = String(
            Number(document.body.dataset.workerCount ?? 0) + 1
          );
          this.addEventListener("error", (event) => {
            document.body.dataset.workerError =
              event.message || "worker script error";
          });
          this.addEventListener("message", ({ data }) => {
            if (data.type === "fixture-sleep") {
              document.body.dataset.sleepCount = String(
                Number(document.body.dataset.sleepCount ?? 0) + 1
              );
            }
            if (data.type === "fixture-release") {
              document.body.dataset.releaseY = String(data.y);
              document.body.dataset.releasedAt = String(performance.now());
              document.body.dataset.releaseCount = String(
                Number(document.body.dataset.releaseCount ?? 0) + 1
              );
            }
            if (data.type === "fixture-pose") {
              document.body.dataset.poseY = String(data.y);
            }
            if (data.type === "fixture-metrics") {
              document.body.dataset.rendererStats = JSON.stringify(data.data);
            }
            if (data.type === "error") {
              document.body.dataset.workerError = data.message ?? "unknown";
            }
            if (data.type === "ready" && !completed) {
              completed = true;
              document.body.dataset.readyAt = String(performance.now());
              maximum = Math.max(maximum, performance.now() - previous);
              cancelAnimationFrame(heartbeat);
              document.body.dataset.workerReady = "true";
              document.body.dataset.startupMaxGap = String(maximum);
              document.body.dataset.startupElapsed = String(
                performance.now() - began
              );
            }
            if (data.type !== "fixture-text") {
              return;
            }
            document.body.dataset.badgeText = JSON.stringify([
              ...JSON.parse(document.body.dataset.badgeText ?? "[]"),
              data.text,
            ]);
            document.body.dataset.badgeInk = data.color;
          });
        }
      };
      const terminate = window.Worker.prototype.terminate;
      window.Worker.prototype.terminate = function () {
        document.body.dataset.workerTerminated = String(
          Number(document.body.dataset.workerTerminated ?? 0) + 1
        );
        terminate.call(this);
      };
      const fillText = CanvasRenderingContext2D.prototype.fillText;
      CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
        document.body.dataset.badgeText = JSON.stringify([
          ...JSON.parse(document.body.dataset.badgeText ?? "[]"),
          text,
        ]);
        document.body.dataset.badgeInk = String(this.fillStyle);
        fillText.call(this, text, ...args);
      };
    },
    {
      source: workerBundle,
      preview: withPreview ? fixturePreview : undefined,
      startupDelay,
      frameJitter,
      initialPortrait,
      failWorker,
      captureText,
    }
  );
  await page.addScriptTag({ content: clientBundle });
}

test("the badge keeps authored faces, flips without dragging, follows themes, and needs no model or strap image", async ({
  page,
  isMobile,
}, testInfo) => {
  const errors: string[] = [];
  const requests: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("request", (request) => requests.push(request.url()));
  const width = isMobile ? 250 : 360;
  const height = isMobile ? 360 : 820;
  await mountFixture(page, isMobile);
  const canvas = page.locator(".lanyard-wrapper canvas");
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute("data-ready", "true", {
    timeout: 15_000,
  });
  await expect(page.locator("body")).not.toHaveAttribute("data-worker-error");
  await expect(page.locator("body")).toHaveAttribute(
    "data-worker-ready",
    "true"
  );
  await expect(page.locator("body")).toHaveAttribute(
    "data-badge-text",
    ORIGINAL_TEXT
  );
  await page.waitForTimeout(2500);
  const stats = await page.locator("body").getAttribute("data-renderer-stats");
  await writeFile(testInfo.outputPath("renderer-stats.json"), stats ?? "{}");
  const resources = JSON.parse(stats ?? "{}");
  expect(
    Math.max(resources.faceWidth, resources.faceHeight)
  ).toBeLessThanOrEqual(2048);
  expect(resources.geometries).toBeLessThanOrEqual(6);
  expect(resources.pixelRatio).toBeLessThanOrEqual(2);
  expect(resources.antialias).toBe(true);
  const front = await renderedCard(canvas);
  expect(front.ink).toBeLessThan(20);
  expect(front.pill).toEqual([245, 245, 245]);
  await canvas.screenshot({
    path: testInfo.outputPath("lanyard-front.png"),
    omitBackground: true,
  });
  const viewHeight = 60 * Math.tan((11 * Math.PI) / 360);
  expect(
    Math.abs(front.width - (1.611_940_3 / viewHeight) * height)
  ).toBeLessThan(2);
  expect(Math.abs(front.height - (2.25 / viewHeight) * height)).toBeLessThan(2);
  expect(Math.abs(front.left + front.width / 2 - width / 2)).toBeLessThan(1);
  expect(Math.abs(front.top - (isMobile ? 133 : 302))).toBeLessThan(3);
  const bounds = await canvas.boundingBox();
  if (!bounds) {
    throw new Error("Badge canvas has no dimensions");
  }
  const center = {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height * 0.55,
  };
  const clickCard = () =>
    isMobile
      ? page.touchscreen.tap(center.x, center.y)
      : page.mouse.click(center.x, center.y);
  await page.mouse.move(center.x, center.y);
  await expect(canvas).toHaveCSS("cursor", "pointer");
  await page.mouse.down();
  await page.mouse.move(center.x + 30, center.y + 20, { steps: 5 });
  await expect(canvas).toHaveCSS("cursor", "pointer");
  const held = await renderedCard(canvas);
  expect(Math.abs(held.left - front.left)).toBeLessThan(1);
  expect(Math.abs(held.top - front.top)).toBeLessThan(1);
  await page.mouse.up();
  await page.waitForTimeout(1500);
  expect(await titleInk(canvas)).toBeLessThan(20);

  await clickCard();
  await expect.poll(() => titleInk(canvas)).toBeGreaterThan(30);
  await page.waitForTimeout(2000);
  // The back must remain readable once rotation settles; depth fighting used
  // to erase portions of the text after a successful initial flip.
  await canvas.screenshot({
    path: testInfo.outputPath("lanyard-back.png"),
    omitBackground: true,
  });
  for (let frame = 0; frame < 3; frame++) {
    // biome-ignore lint/performance/noAwaitInLoops: Sample distinct frames to catch intermittent face corruption.
    expect(await titleInk(canvas)).toBeGreaterThan(30);
  }
  await clickCard();
  await expect.poll(() => titleInk(canvas)).toBeLessThan(20);
  await expect
    .poll(async () =>
      Math.abs((await renderedCard(canvas)).width - front.width)
    )
    .toBeLessThan(1);

  await page.getByRole("button", { name: "Update badge" }).click();
  await expect(page.locator("body")).toHaveAttribute(
    "data-badge-text",
    UPDATED_TEXT
  );
  await page.getByRole("button", { name: "Dark theme" }).click();
  await expect(page.locator("html")).toHaveClass("dark");
  await expect(page.locator("body")).toHaveAttribute(
    "data-badge-ink",
    "#888888"
  );
  // Worker texture updates can precede the next composited canvas frame.
  await expect
    .poll(async () => (await renderedCard(canvas)).pill)
    .toEqual([20, 20, 20]);
  await canvas.screenshot({
    path: testInfo.outputPath("lanyard-dark-front.png"),
    omitBackground: true,
  });
  await clickCard();
  await page.waitForTimeout(2000);
  expect(await titleInk(canvas)).toBeGreaterThan(30);
  await canvas.screenshot({
    path: testInfo.outputPath("lanyard-dark-back.png"),
    omitBackground: true,
  });
  await clickCard();
  await page.waitForTimeout(2000);
  await page.getByRole("button", { name: "Toggle portrait" }).click();
  await expect
    .poll(async () => (await renderedCard(canvas)).avatar)
    .toEqual([255, 0, 0]);
  await page.getByRole("button", { name: "Toggle portrait" }).click();
  await expect
    .poll(async () => (await renderedCard(canvas)).avatar)
    .not.toEqual([255, 0, 0]);
  await page.getByRole("button", { name: "Toggle badge" }).click();
  await expect(canvas).toHaveCount(0);
  await page.getByRole("button", { name: "Toggle badge" }).click();
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute("data-ready", "true", {
    timeout: 15_000,
  });
  if (isMobile) {
    const cdp = await page.context().newCDPSession(page);
    const initialScale = await page.evaluate(
      () => window.visualViewport?.scale ?? 1
    );
    await cdp.send("Input.synthesizePinchGesture", {
      x: center.x,
      y: center.y,
      scaleFactor: 1.5,
      relativeSpeed: 400,
      gestureSourceType: "touch",
    });
    await expect
      .poll(() => page.evaluate(() => window.visualViewport?.scale ?? 1))
      .toBeGreaterThan(initialScale * 1.2);
    await cdp.send("Input.synthesizePinchGesture", {
      x: center.x,
      y: center.y,
      scaleFactor: 1 / 1.5,
      relativeSpeed: 400,
      gestureSourceType: "touch",
    });
    await expect
      .poll(() => page.evaluate(() => window.visualViewport?.scale ?? 1))
      .toBeCloseTo(initialScale, 1);
    await cdp.detach();
    expect(await titleInk(canvas)).toBeLessThan(20);
    await clickCard();
    await expect.poll(() => titleInk(canvas)).toBeGreaterThan(30);
  }
  expect(
    requests.filter(
      (url) =>
        !(
          url === "https://lanyard.test/" ||
          url.startsWith("data:") ||
          url.startsWith("blob:")
        )
    )
  ).toEqual([]);
  expect(errors).toEqual([]);
});

test("worker initialization keeps the page responsive under mobile CPU throttling", async ({
  page,
  isMobile,
}, testInfo) => {
  test.skip(!isMobile, "Measure the constrained mobile path");
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 6 });
  await mountFixture(page, true, {
    captureText: false,
    withPreview: true,
  });
  await expect(page.locator("body")).toHaveAttribute(
    "data-worker-started",
    "true"
  );
  await page.locator("#startup-action").click();
  await expect(page.locator("#startup-action")).toHaveText("Clicked");
  await expect(page.locator("body")).toHaveAttribute(
    "data-worker-ready",
    "true",
    { timeout: 20_000 }
  );
  const measurements = await page.locator("body").evaluate((element) => ({
    maximumMainThreadGap: Number(element.dataset.startupMaxGap),
    initializationMilliseconds: Number(element.dataset.startupElapsed),
    longTasks: JSON.parse(element.dataset.longTasks ?? "[]").filter(
      (task: { start: number; duration: number }) =>
        task.start + task.duration >= Number(element.dataset.workerBegan)
    ),
    workerBegan: Number(element.dataset.workerBegan),
    workerConstructed: Number(element.dataset.workerConstructed),
    gapStart: Number(element.dataset.gapStart),
    gapEnd: Number(element.dataset.gapEnd),
  }));
  const performanceResult = {
    ...measurements,
    cpuThrottle: 6,
    heartbeat: "requestAnimationFrame",
    graphicsRenderer: await page
      .locator("body")
      .evaluate(
        (element) =>
          JSON.parse(element.dataset.rendererStats ?? "{}").graphicsRenderer
      ),
    clientBundleBytes: clientBundle.length,
    workerBundleBytes: workerBundle.length,
  };
  const report = testInfo.outputPath("startup-performance.json");
  await writeFile(report, JSON.stringify(performanceResult, null, 2));
  await testInfo.attach("startup-performance", {
    path: report,
    contentType: "application/json",
  });
  expect(measurements.maximumMainThreadGap).toBeLessThan(150);
  await cdp.detach();
});

test("worker failure keeps a sharp static preview without starting main-thread WebGL", async ({
  page,
  isMobile,
}) => {
  await mountFixture(page, isMobile, { failWorker: true, withPreview: true });
  await expect(page.locator(".lanyard-wrapper")).toHaveAttribute(
    "data-state",
    "static"
  );
  await expect(page.locator(".lanyard-wrapper canvas")).toHaveCount(0);
  const image = page.locator("[data-preview] img:visible");
  await expect(image).toHaveCount(1);
  await expect
    .poll(() =>
      image.evaluate((element) => (element as HTMLImageElement).naturalWidth)
    )
    .toBeGreaterThan(0);
  await expect(page.locator("body")).not.toHaveAttribute("data-worker-ready");
  await expect(page.locator("body")).not.toHaveAttribute("data-badge-text");
  await page.getByRole("button", { name: "Dark theme" }).click();
  await expect(image).toHaveCount(1);
  await expect
    .poll(() =>
      image.evaluate((element) => (element as HTMLImageElement).currentSrc)
    )
    .toBe(
      (isMobile ? fixturePreview.mobile : fixturePreview.desktop).dark.rest[
        isMobile ? "src2x" : "src"
      ]
    );
  await page.locator("#startup-action").click();
  await expect(page.locator("#startup-action")).toHaveText("Clicked");
});

test("preview resolution follows screen density and preserves its aspect ratio", async ({
  browser,
  isMobile,
}) => {
  test.skip(isMobile, "This test covers both layouts in isolated contexts.");
  for (const mobile of [false, true]) {
    for (const pixelRatio of [1, 2]) {
      // biome-ignore lint/performance/noAwaitInLoops: Each density needs an isolated browser cache.
      const context = await browser.newContext({
        viewport: mobile
          ? { width: 390, height: 844 }
          : { width: 1280, height: 900 },
        deviceScaleFactor: pixelRatio,
      });
      try {
        const page = await context.newPage();
        await mountFixture(page, mobile, {
          failWorker: true,
          withPreview: true,
        });
        const image = page.locator("[data-preview] img:visible");
        const expected = (
          mobile ? fixturePreview.mobile : fixturePreview.desktop
        ).light.rest[pixelRatio === 1 ? "src" : "src2x"];
        await expect
          .poll(() =>
            image.evaluate(
              (element) => (element as HTMLImageElement).currentSrc
            )
          )
          .toBe(expected);
        await expect(image).toHaveCSS("object-fit", "contain");
        const ratioError = await image.evaluate(async (element) => {
          const img = element as HTMLImageElement;
          await img.decode();
          const bounds = img.getBoundingClientRect();
          return Math.abs(
            bounds.width -
              bounds.height * (img.naturalWidth / img.naturalHeight)
          );
        });
        expect(ratioError).toBeLessThan(2);
      } finally {
        await context.close();
      }
    }
  }
});

test("the preview covers loading and physics waits for the completed handoff", async ({
  page,
  isMobile,
}, testInfo) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await mountFixture(page, isMobile, {
    withPreview: true,
    reducedMotion: false,
    startupDelay: 900,
  });
  const wrapper = page.locator(".lanyard-wrapper");
  const canvas = wrapper.locator("canvas");
  const preview = page.locator("[data-preview] img:visible");
  await expect(preview).toHaveCount(1);
  await expect
    .poll(() =>
      preview.evaluate((image) => (image as HTMLImageElement).naturalWidth)
    )
    .toBeGreaterThan(0);
  await expect(canvas).toHaveCSS("opacity", "0");
  await expect(wrapper).toHaveAttribute("data-state", "loading");
  await wrapper.screenshot({
    path: testInfo.outputPath("loading-preview.png"),
    omitBackground: true,
  });
  const loaded = requests.filter((url) => url.includes("/previews/"));
  expect(loaded).toEqual([
    isMobile
      ? fixturePreview.mobile.light.entrance.src2x
      : fixturePreview.desktop.light.entrance.src,
  ]);
  await expect(wrapper).toHaveAttribute("data-state", "live", {
    timeout: 15_000,
  });
  await expect(page.locator("[data-preview]")).not.toBeVisible();
  await expect(page.locator("body")).toHaveAttribute("data-release-count", "1");
  const timing = await page.locator("body").evaluate((body) => ({
    heldY: JSON.parse(body.dataset.rendererStats ?? "{}").bodyY,
    releaseY: Number(body.dataset.releaseY),
    elapsed: Number(body.dataset.releasedAt) - Number(body.dataset.readyAt),
  }));
  expect(timing.releaseY).toBeCloseTo(timing.heldY, 8);
  expect(timing.elapsed).toBeGreaterThanOrEqual(140);
  await expect
    .poll(() =>
      page
        .locator("body")
        .evaluate((body) => Number(body.dataset.poseY ?? "Infinity"))
    )
    .toBeLessThan(timing.heldY - 0.05);
  await canvas.screenshot({
    path: testInfo.outputPath("settled-after-handoff.png"),
    omitBackground: true,
  });
  await page.getByRole("button", { name: "Dark theme" }).click();
  await expect(page.locator("body")).toHaveAttribute(
    "data-badge-ink",
    "#888888"
  );
  await expect(page.locator("body")).toHaveAttribute("data-release-count", "1");
});

test("reduced motion, theme changes, and resizing during loading use the latest complete frame", async ({
  page,
  isMobile,
}) => {
  await mountFixture(page, isMobile, { withPreview: true, startupDelay: 600 });
  await expect(page.locator("[data-preview] img:visible")).toHaveAttribute(
    "src",
    fixturePreview.mobile.light.rest.src
  );
  await page.getByRole("button", { name: "Dark theme" }).click();
  const width = isMobile ? 260 : 380;
  await page.locator(".lanyard-host").evaluate((host, size) => {
    (host as HTMLElement).style.width = `${size}px`;
  }, width);
  const wrapper = page.locator(".lanyard-wrapper");
  await expect(wrapper).toHaveAttribute("data-state", "live", {
    timeout: 15_000,
  });
  const canvas = wrapper.locator("canvas");
  const pixels = await canvas.evaluate((element) => ({
    width: (element as HTMLCanvasElement).width,
    expected: Math.floor(
      element.getBoundingClientRect().width * Math.min(devicePixelRatio, 2)
    ),
  }));
  expect(pixels.width).toBe(pixels.expected);
  expect((await renderedCard(canvas)).pill).toEqual([20, 20, 20]);
  await expect(page.locator("body")).toHaveAttribute("data-release-count", "1");
  const before = await renderedCard(canvas);
  await page.waitForTimeout(600);
  const after = await renderedCard(canvas);
  expect(after.top).toBe(before.top);
  expect(after.left).toBe(before.left);
  await expect(page.locator("body")).not.toHaveAttribute("data-pose-y");
});

test("a hidden page keeps the prepared badge held until it becomes visible", async ({
  page,
  isMobile,
}) => {
  await mountFixture(page, isMobile, {
    withPreview: true,
    reducedMotion: false,
    startupDelay: 500,
  });
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const wrapper = page.locator(".lanyard-wrapper");
  await expect(wrapper.locator("canvas")).toHaveAttribute(
    "data-frame-ready",
    "true",
    { timeout: 15_000 }
  );
  await expect(wrapper).toHaveAttribute("data-state", "loading");
  await expect(page.locator("body")).not.toHaveAttribute("data-release-count");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(wrapper).toHaveAttribute("data-state", "live");
  const pose = await page.locator("body").evaluate((body) => ({
    ready: JSON.parse(body.dataset.rendererStats ?? "{}").bodyY,
    released: Number(body.dataset.releaseY),
  }));
  expect(pose.released).toBeCloseTo(pose.ready, 8);
});

test("readiness waits for the portrait, and a failed portrait leaves the static preview", async ({
  page,
  isMobile,
}) => {
  await mountFixture(page, isMobile, {
    withPreview: true,
    initialPortrait: "https://lanyard.test/portrait.png",
    portraitDelay: 900,
  });
  await expect(page.locator(".lanyard-wrapper")).toHaveAttribute(
    "data-state",
    "loading"
  );
  await expect(page.locator("body")).not.toHaveAttribute("data-worker-ready");
  await expect(page.locator(".lanyard-wrapper")).toHaveAttribute(
    "data-state",
    "live",
    { timeout: 15_000 }
  );
  expect(
    (await renderedCard(page.locator(".lanyard-wrapper canvas"))).avatar
  ).toEqual([255, 0, 0]);
  await mountFixture(page, isMobile, {
    withPreview: true,
    initialPortrait: "https://lanyard.test/portrait.png",
    portraitError: true,
  });
  await expect(page.locator(".lanyard-wrapper")).toHaveAttribute(
    "data-state",
    "static"
  );
  await expect(page.locator(".lanyard-wrapper canvas")).toHaveCount(0);
  await expect(page.locator("[data-preview] img:visible")).toHaveCount(1);
});

test("a stalled worker times out to a usable static badge", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "The same deadline is used on desktop and mobile");
  await mountFixture(page, false, { withPreview: true, startupDelay: 15_000 });
  await page.locator("#startup-action").click();
  await expect(page.locator("#startup-action")).toHaveText("Clicked");
  await expect(page.locator(".lanyard-wrapper")).toHaveAttribute(
    "data-state",
    "static",
    { timeout: 12_000 }
  );
  await expect(page.locator(".lanyard-wrapper canvas")).toHaveCount(0);
  await expect(page.locator("[data-preview] img:visible")).toHaveCount(1);
});

test("Activity restoration reuses the live canvas and worker, then releases them on cache eviction", async ({
  page,
  isMobile,
}) => {
  await mountFixture(page, isMobile, { withPreview: true, startupDelay: 800 });
  const wrapper = page.locator(".lanyard-wrapper");
  await expect(wrapper).toHaveAttribute("data-state", "live", {
    timeout: 15_000,
  });
  await wrapper.locator("canvas").evaluate((node) => {
    (node as HTMLElement).dataset.activityMarker = "retained";
  });
  await page.getByRole("button", { name: "Hide or restore badge" }).click();
  await expect(wrapper).not.toBeVisible();
  await expect(wrapper.locator("canvas")).toHaveCount(1);
  await expect(page.locator("body")).toHaveAttribute("data-worker-count", "1");
  await page.getByRole("button", { name: "Hide or restore badge" }).click();
  await expect(wrapper).toHaveAttribute("data-state", "live");
  await expect(wrapper.locator("canvas")).toHaveAttribute(
    "data-activity-marker",
    "retained"
  );
  await expect(page.locator("[data-preview]")).not.toBeVisible();
  await expect(page.locator("body")).toHaveAttribute("data-worker-count", "1");
  await page.getByRole("button", { name: "Hide or restore badge" }).click();
  await page.getByRole("button", { name: "Toggle badge", exact: true }).click();
  await expect(wrapper).toHaveCount(0);
  await expect(page.locator("body")).toHaveAttribute(
    "data-worker-terminated",
    "1"
  );
});

test("a stalled replacement preparation gets its own static-fallback deadline", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "The revision watchdog is shared across layouts");
  await mountFixture(page, false, { withPreview: true, startupDelay: 300 });
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const wrapper = page.locator(".lanyard-wrapper");
  await expect(wrapper.locator("canvas")).toHaveAttribute(
    "data-frame-ready",
    "true",
    { timeout: 15_000 }
  );
  await page.getByRole("button", { name: "Stall portrait" }).click();
  await expect(wrapper.locator("canvas")).not.toHaveAttribute(
    "data-frame-ready"
  );
  await expect(wrapper).toHaveAttribute("data-state", "static", {
    timeout: 12_000,
  });
  await expect(wrapper.locator("canvas")).toHaveCount(0);
});

test("a settled simulation sleeps despite frame jitter and wakes for a flip", async ({
  page,
  isMobile,
}) => {
  await mountFixture(page, isMobile, {
    withPreview: true,
    reducedMotion: false,
    frameJitter: true,
  });
  const wrapper = page.locator(".lanyard-wrapper");
  await expect(wrapper).toHaveAttribute("data-state", "live", {
    timeout: 15_000,
  });
  await expect(page.locator("body")).toHaveAttribute("data-sleep-count", "1", {
    timeout: 10_000,
  });
  const box = await wrapper.boundingBox();
  if (!box) {
    throw new Error("Missing badge dimensions");
  }
  const point = { x: box.x + box.width / 2, y: box.y + box.height * 0.55 };
  if (isMobile) {
    await page.touchscreen.tap(point.x, point.y);
  } else {
    await page.mouse.click(point.x, point.y);
  }
  await expect
    .poll(() => titleInk(wrapper.locator("canvas")))
    .toBeGreaterThan(30);
  await expect(page.locator("body")).toHaveAttribute("data-sleep-count", "2", {
    timeout: 10_000,
  });
});
