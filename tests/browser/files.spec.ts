import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { expect, type Page, test } from "@playwright/test";

const origin = "http://127.0.0.1:3100";
const file = (path: string, endpoint = "content") =>
  `${origin}/api/files/${endpoint}?${new URLSearchParams({ path })}`;
const downloads = /attachment/;
const privateCache = /no-store/;
const japanese = /日本語/;
const guide = "Guide.txt";
const portfolioHome = /^https?:\/\/.+\/en$/;
const portfolioBlog = /^https?:\/\/.+\/en\/blog$/;
const zipStart = 0x04_03_4b_50;
const zipEnd = 0x06_05_4b_50;
const photoPreview = /\/api\/files\/content\?.*preview=1/;

function locationCrumb(page: Page, name: string) {
  return page
    .getByRole("navigation", { name: "File location" })
    .getByRole("heading", { name, exact: true });
}

function directoryLink(page: Page, name: string) {
  return page
    .locator('[data-slot="file-system"]')
    .getByRole("link")
    .and(page.getByTitle(name, { exact: true }));
}

function expectArchive(bytes: Buffer, ...entries: string[]) {
  expect(bytes.readUInt32LE(0)).toBe(zipStart);
  expect(bytes.readUInt32LE(bytes.length - 22)).toBe(zipEnd);
  for (const name of entries) {
    expect(bytes.includes(Buffer.from(name))).toBe(true);
  }
}

test("files without a preview show illustrated file details and offer a download", async ({
  page,
}) => {
  await page.goto(`${origin}/en/browse/Archive/large.bin`);
  const main = page.getByRole("main");
  await expect(locationCrumb(page, "large.bin")).toHaveAttribute(
    "aria-current",
    "page"
  );
  await expect(page.locator("main > h1")).toHaveCount(0);
  await expect(
    main.getByRole("heading", { name: "File details" })
  ).toBeVisible();
  await expect(main.getByText("application/octet-stream")).toBeVisible();
  await expect(main.getByText("5.2 MB", { exact: true })).toBeVisible();
  await expect(main.locator("time")).toHaveAttribute(
    "datetime",
    "2026-11-01T02:00:00Z"
  );
  await expect(main.getByRole("heading", { name: "Checksums" })).toBeVisible();
  await expect(main.getByText("AAECAwQFBgcICQoLDA0ODxAREhM=")).toBeVisible();
  await expect(
    main.getByText("f0a9cd8681a4f45b8aba8f08e5d42f8f8437d066")
  ).toBeVisible();
  const illustration = main.locator('img[src="/assets/file-details.webp"]');
  await expect
    .poll(() =>
      illustration.evaluate((image: HTMLImageElement) => image.naturalWidth)
    )
    .toBeGreaterThan(0);

  const pendingDownload = page.waitForEvent("download");
  await main.getByRole("link", { exact: true, name: "Download" }).click();
  expect((await pendingDownload).suggestedFilename()).toBe("large.bin");
});

test("failed previews show the available file details", async ({ page }) => {
  await page.route(photoPreview, (route) => route.fulfill({ status: 503 }));
  await page.goto(`${origin}/en/browse/Photo.png`);
  const main = page.getByRole("main");
  await expect(
    main.getByRole("heading", { name: "File details" })
  ).toBeVisible();
  await expect(main.getByText("Preview unavailable")).toBeVisible();
  await expect(main.getByText("Modified")).toBeVisible();
  await expect(main.getByText("MIME type")).toHaveCount(0);
  await expect(main.getByRole("heading", { name: "Checksums" })).toHaveCount(0);
});

test("browse, page forward, follow a file link and return to the folder", async ({
  isMobile,
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(origin);
  await expect(page).toHaveURL(`${origin}/en/browse`);
  const homeCrumb = locationCrumb(page, "All files");
  await expect(homeCrumb.locator("svg")).toBeVisible();
  await expect(homeCrumb).toHaveAttribute("aria-current", "page");
  await expect(homeCrumb).toBeEmpty();
  await expect(page.locator("main > h1")).toHaveCount(0);
  const homeIcon = homeCrumb.locator("svg");
  const homeIconWidth = await homeIcon.evaluate(
    (icon) => getComputedStyle(icon).width
  );
  await expect(
    page.getByRole("heading", { name: "Public archive" })
  ).toBeVisible();
  const header = page.getByRole("banner");
  await expect(header.getByRole("link").first()).toHaveAttribute(
    "href",
    portfolioHome
  );
  if (isMobile) {
    await header.getByRole("button", { name: "Toggle menu" }).click();
  }
  const navigation = isMobile ? page.getByRole("dialog") : header;
  await expect(navigation.getByRole("link", { name: "Blog" })).toHaveAttribute(
    "href",
    portfolioBlog
  );
  await expect(
    navigation.getByRole("link", { name: "Files", exact: true })
  ).toHaveAttribute("href", "/en/browse");
  if (isMobile) {
    await page.keyboard.press("Escape");
    await expect(navigation).toBeHidden();
  }

  await page.getByRole("button", { name: "Load more" }).click();
  await expect(directoryLink(page, "Photo.png")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Unpublished shortcut" })
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Grid view" }).click();
  await expect(page.getByRole("table")).toHaveCount(0);
  const started = page.waitForEvent("download");
  await page
    .getByRole("link", { exact: true, name: "Download 50% ready #1.txt" })
    .click();
  const download = await started;
  expect(download.suggestedFilename()).toBe("50% ready #1.txt");
  await expect(
    page.getByRole("button", {
      exact: true,
      name: "Copy link to 50% ready #1.txt",
    })
  ).toBeVisible();
  await directoryLink(page, "50% ready #1.txt").click();
  await expect(page).toHaveURL(`${origin}/en/browse/50%25%20ready%20%231.txt`);
  const homeLink = page
    .getByRole("navigation", { name: "File location" })
    .getByRole("link", { name: "All files" });
  await expect(homeLink).toHaveAttribute("href", "/en/browse");
  await expect(homeLink.locator("svg")).toHaveCSS("width", homeIconWidth);
  await expect(homeLink.locator("svg")).toHaveCSS("height", homeIconWidth);
  const textPreview = page.getByRole("main").getByRole("code");
  await expect(textPreview).toHaveText("Unicode test: 資料");
  await page.reload();
  await expect(textPreview).toHaveText("Unicode test: 資料");
  await page.goBack();
  await expect(homeCrumb).toBeVisible();
  await expect(page.getByRole("button", { name: "Grid view" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(page.getByRole("table")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("the mobile files menu follows a portfolio link and closes on browser back", async ({
  isMobile,
  page,
}) => {
  test.skip(!isMobile, "The menu is only shown below the desktop breakpoint.");
  await page.route(portfolioBlog, (route) => route.fulfill({ body: "Blog" }));
  await page.goto(`${origin}/en/browse`);
  await page.getByRole("button", { name: "Toggle menu" }).click();
  const dialog = page.getByRole("dialog", { name: "Main navigation" });
  await dialog.getByRole("link", { name: "Blog", exact: true }).click();
  await expect(page).toHaveURL(portfolioBlog);
  await page.goBack();
  await expect(page).toHaveURL(`${origin}/en/browse`);
  await expect(dialog).toBeHidden();
});

for (const { fragment, title } of [
  {
    fragment: "",
    title: "language switching and returning keeps the file browser working",
  },
  {
    fragment: "#sample",
    title: "language switching and returning preserves a shared URL fragment",
  },
]) {
  test(title, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const path = `/browse/50%25%20ready%20%231.txt?from=share${fragment}`;
    const preview = page.getByRole("main").getByRole("code");
    await page.goto(`${origin}/en${path}`);
    await expect(locationCrumb(page, "50% ready #1.txt")).toBeVisible();
    await expect(preview).toHaveText("Unicode test: 資料");
    const switcher = page.getByRole("button", { name: "Switch language" });
    await expect(switcher).toBeVisible();
    await switcher.click();
    await expect(
      page.getByRole("menuitem", { name: "English" })
    ).toHaveAttribute("aria-current", "page");
    await page.getByRole("menuitem", { name: japanese }).click();
    await expect(page).toHaveURL(`${origin}/ja${path}`);
    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
    const breadcrumb = page.getByRole("navigation", { name: "ファイルの場所" });
    const homeLink = breadcrumb.getByRole("link", { name: "すべてのファイル" });
    await expect(homeLink.locator("svg")).toBeVisible();
    await expect(homeLink).toBeEmpty();
    await expect(homeLink).toHaveAttribute("href", "/ja/browse");
    await expect(
      breadcrumb.getByRole("heading", { name: "50% ready #1.txt" })
    ).toHaveAttribute("aria-current", "page");
    await expect(preview).toHaveText("Unicode test: 資料");

    await page.getByRole("button", { name: "言語を切り替える" }).click();
    await page.getByRole("menuitem", { name: "English" }).click();
    await expect(page).toHaveURL(`${origin}/en${path}`);
    await expect(preview).toHaveText("Unicode test: 資料");

    await page.goBack();
    await expect(page).toHaveURL(`${origin}/ja${path}`);
    await expect(preview).toHaveText("Unicode test: 資料");

    await page.getByRole("button", { name: "言語を切り替える" }).click();
    await page.getByRole("menuitem", { name: "中文" }).click();
    await expect(page).toHaveURL(`${origin}/zh${path}`);
    await expect(page.locator("html")).toHaveAttribute("lang", "zh");
    const chineseHome = page.getByRole("link", { name: "所有文件" });
    await expect(chineseHome.locator("svg")).toBeVisible();
    await chineseHome.press("Enter");
    await expect(page).toHaveURL(`${origin}/zh/browse`);
    await expect(
      page.getByRole("heading", { name: "所有文件" })
    ).toHaveAttribute("aria-current", "page");
    expect(errors).toEqual([]);
  });
}

test("page links and direct bytes support sharing, embeds, and ranges", async ({
  page,
}) => {
  await page.goto(`${origin}/en/browse/Documents/Guide.txt`);
  const preview = page.getByText("Public file fixture");
  const download = page.getByRole("link", { exact: true, name: "Download" });
  await expect(preview).toBeVisible();
  await expect(download).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Copy link", exact: true })
  ).toHaveCount(0);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  const originalLayout = await Promise.all([
    download.boundingBox(),
    preview.boundingBox(),
  ]);
  await page
    .context()
    .grantPermissions(["clipboard-read", "clipboard-write"], { origin });
  await page.getByRole("button", { name: "Copy direct link" }).click();
  const directLink = file("Documents/Guide.txt");
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(directLink);
  await expect(page.locator('[data-slot="toast-title"]')).toHaveText(
    "Link copied"
  );
  expect(
    await Promise.all([download.boundingBox(), preview.boundingBox()])
  ).toEqual(originalLayout);
  const direct = await page.request.get(directLink);
  expect(await direct.text()).toBe("Public file fixture");
  expect(direct.headers().location).toBeUndefined();
  const head = await page.request.head(directLink);
  expect(head.status()).toBe(200);
  expect(head.headers()["content-type"]).toBe(direct.headers()["content-type"]);
  expect(head.headers()["accept-ranges"]).toBe("bytes");
  expect(await head.text()).toBe("");
  const preflight = await page.request.fetch(directLink, {
    headers: {
      "Access-Control-Request-Headers": "range",
      "Access-Control-Request-Method": "GET",
      Origin: "https://example.test",
    },
    method: "OPTIONS",
  });
  expect(preflight.status()).toBe(204);
  expect(preflight.headers()["access-control-allow-headers"]).toBe("Range");
  const range = await page.request.get(directLink, {
    headers: { Range: "bytes=0-5" },
  });
  expect(range.status()).toBe(206);
  expect(range.headers()["access-control-expose-headers"]).toContain(
    "Content-Range"
  );
  expect(await range.text()).toBe("Public");
  const invalidRange = await page.request.get(directLink, {
    headers: { Range: "bytes=50-60" },
  });
  expect(invalidRange.status()).toBe(416);
  expect(invalidRange.headers()["content-range"]).toBe("bytes */19");
  expect(invalidRange.headers()["access-control-allow-origin"]).toBe("*");
  expect(invalidRange.headers()["cross-origin-resource-policy"]).toBe(
    "cross-origin"
  );

  const embedUrl = file("Photo.png");
  const image = await page.request.get(embedUrl, {
    headers: { Origin: "https://example.test" },
  });
  expect(image.status()).toBe(200);
  expect(image.headers()["access-control-allow-origin"]).toBe("*");
  expect(image.headers()["cross-origin-resource-policy"]).toBe("cross-origin");
  expect(image.headers()["content-type"]).toBe("image/png");
  expect(image.headers()["content-security-policy"]).toContain("sandbox");
  const thumbnail = await page.request.get(file("Photo.png", "thumbnail"));
  expect(thumbnail.status()).toBe(200);
  expect(thumbnail.headers()["cross-origin-resource-policy"]).toBe(
    "cross-origin"
  );
  expect(await thumbnail.body()).toEqual(await image.body());
  const embed = createServer((_request, response) => {
    response.writeHead(200, { "Content-Type": "text/html" });
    response.end(`<img alt="Public hosted image" src="${embedUrl}">`);
  });
  embed.listen(0, "127.0.0.1");
  await once(embed, "listening");
  try {
    const address = embed.address();
    if (!address || typeof address === "string") {
      throw new Error("The embed test server needs a TCP port.");
    }
    await page.goto(`http://127.0.0.1:${address.port}/`);
    await expect
      .poll(() =>
        page
          .getByAltText("Public hosted image")
          .evaluate((node: HTMLImageElement) => node.naturalWidth)
      )
      .toBe(1);
  } finally {
    embed.closeAllConnections();
    await new Promise<void>((resolve) => embed.close(() => resolve()));
  }
});

test("selected files and nested folder ZIPs download through the browser", async ({
  page,
}) => {
  await page.goto(`${origin}/en/browse/Documents`);
  await expect(locationCrumb(page, "Documents")).toHaveAttribute(
    "aria-current",
    "page"
  );
  await expect(page.locator("main > h1")).toHaveCount(0);
  await expect(directoryLink(page, guide)).toBeVisible();
  const folderActions = page.getByRole("button", { name: "Folder actions" });
  const selectAll = page.getByRole("checkbox", {
    name: "Select all loaded items",
  });
  await expect(folderActions).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Copy links as a list" })
  ).toHaveCount(0);
  await page.getByRole("checkbox", { name: "Select Guide.txt" }).check();
  await expect(selectAll).toHaveAttribute("aria-checked", "mixed");
  await expect(page.getByRole("status")).toHaveText("1 selected");
  await expect(folderActions).toHaveCount(0);
  const pendingFile = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download selected" }).click();
  expect((await pendingFile).suggestedFilename()).toBe("Guide.txt");
  await page.getByRole("checkbox", { name: "Select sample.pdf" }).check();
  const nestedFolder = page.getByRole("checkbox", { name: "Select Nested" });
  await nestedFolder.check();
  await page
    .context()
    .grantPermissions(["clipboard-read", "clipboard-write"], { origin });
  await page.getByRole("button", { name: "Copy links as a list" }).click();
  const expectedLinks = [
    file("Documents/Guide.txt"),
    file("Documents/sample.pdf"),
    `${origin}/en/browse/Documents/Nested`,
  ].sort();
  await expect
    .poll(() =>
      page.evaluate(async () =>
        (await navigator.clipboard.readText()).split("\n").sort()
      )
    )
    .toEqual(expectedLinks);
  await expect(page.getByText("Open one link at a time.")).toBeVisible();
  const copiedResponses = await Promise.all(
    expectedLinks.map((link) => page.request.get(link))
  );
  expect(copiedResponses.every((response) => response.ok())).toBe(true);
  await nestedFolder.uncheck();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download selected" }).click();
  const selection = await pending;
  expect(selection.suggestedFilename()).toBe("Documents.zip");
  const selected = await readFile(await selection.path());
  expectArchive(selected, "Guide.txt", "sample.pdf", "Public file fixture");
  expect(selected.includes(Buffer.from("sample.docx"))).toBe(false);

  await page.getByRole("button", { name: "Clear selection" }).click();
  await expect(selectAll).not.toBeChecked();
  await expect(selectAll).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Copy links as a list" })
  ).toHaveCount(0);
  await folderActions.click();
  await page.getByRole("menuitem", { name: "Copy link" }).click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(`${origin}/en/browse/Documents`);
  await folderActions.click();
  const downloadFolder = page.getByRole("menuitem", {
    name: "Download folder as ZIP",
  });
  await expect(downloadFolder).toHaveAccessibleDescription("Up to 5,000 items");
  const pendingFolder = page.waitForEvent("download");
  await downloadFolder.click();
  const folder = await pendingFolder;
  expect(folder.suggestedFilename()).toBe("Documents.zip");
  const downloaded = await readFile(await folder.path());
  expectArchive(
    downloaded,
    "Documents/Guide.txt",
    "Documents/sample.xlsx",
    "Documents/Nested/Deep/Deep guide.txt",
    "Nested public file fixture"
  );
});

test("select all tracks loaded entries and keeps selection when switching views", async ({
  page,
}) => {
  await page.goto(`${origin}/en/browse`);
  const selectAll = page.getByRole("checkbox", {
    name: "Select all loaded items",
  });
  const documents = page.getByRole("checkbox", { name: "Select Documents" });
  await selectAll.check();
  await expect(documents).toBeChecked();
  await page.getByRole("button", { name: "Load more" }).click();
  const photo = page.getByRole("checkbox", { name: "Select Photo.png" });
  await expect(photo).toBeVisible();
  await expect(photo).not.toBeChecked();
  await expect(selectAll).toHaveAttribute("aria-checked", "mixed");

  await page.getByRole("button", { name: "Grid view" }).click();
  await expect(documents).toBeChecked();
  await expect(photo).not.toBeChecked();
  await selectAll.check();
  await expect(photo).toBeChecked();
  await selectAll.uncheck();
  await expect(documents).not.toBeChecked();
  await expect(photo).not.toBeChecked();
  await expect(
    page.getByRole("button", { name: "Folder actions" })
  ).toBeVisible();

  // This corner of the preview used to be covered by the checkbox hit area.
  await directoryLink(page, "Photo.png").click({ position: { x: 16, y: 16 } });
  await expect(locationCrumb(page, "Photo.png")).toBeVisible();
});

test("Internet shortcuts preview their full external destination", async ({
  page,
}) => {
  await page.goto(`${origin}/en/browse/Documents/Project.url`);
  await expect(page.getByRole("link", { name: "Open link" })).toHaveAttribute(
    "href",
    "https://example.test/?a=b&c=d"
  );
});

test("published content streams and private paths and shortcuts stay outside the file index", async ({
  page,
}) => {
  const archive = `${origin}/api/files/archive`;
  const denied = [
    file("../Private/private-notes.txt"),
    file("Private/private-notes.txt"),
    file("Private", "browse"),
    file("Unpublished shortcut", "browse"),
    file("Unpublished shortcut/private-notes.txt"),
    file("Private/private-notes.txt", "thumbnail"),
  ];
  const statuses = await Promise.all(
    denied.map(async (url) => (await page.request.get(url)).status())
  );
  expect(statuses).toEqual([400, 404, 404, 404, 404, 404]);
  expect(
    (await page.request.post(archive, { form: { path: "Private" } })).status()
  ).toBe(404);
  expect(
    (
      await page.request.post(archive, {
        form: { path: "Documents" },
        headers: { Origin: "https://example.test" },
      })
    ).status()
  ).toBe(403);

  await page.goto(`${origin}/en/browse/Private`);
  await expect(
    page.getByRole("heading", { name: "File or folder not found" })
  ).toBeVisible();

  const large = await page.request.get(file("Archive/large.bin"));
  expect(large.headers()["content-disposition"]).toMatch(downloads);
  expect(large.headers()["cache-control"]).toMatch(privateCache);
  expect((await large.body()).byteLength).toBe(5 * 1024 * 1024);
});

const deepFolder = "Documents/Nested/Deep";
const deepFile = `${deepFolder}/Deep guide.txt`;
const deepTitle = "Deep guide.txt";

function isBrowseRequest(url: URL, path: string) {
  return (
    url.pathname === "/api/files/browse" &&
    url.searchParams.get("path") === path
  );
}

for (const { path, filename, panelSelector, hasTextPreview } of [
  {
    path: "Archive/large.bin",
    filename: "large.bin",
    panelSelector: '[data-slot="card"]',
    hasTextPreview: false,
  },
  {
    path: "Documents/Guide.txt",
    filename: guide,
    panelSelector: "pre",
    hasTextPreview: true,
  },
]) {
  test(`keeps the breadcrumb and preview position stable while loading ${filename}`, async ({
    page,
  }) => {
    const listing = Promise.withResolvers<void>();
    const content = Promise.withResolvers<void>();
    await page.route(
      (url) => isBrowseRequest(url, path),
      async (route) => {
        await listing.promise;
        await route.continue();
      }
    );
    if (hasTextPreview) {
      await page.route(
        (url) =>
          url.pathname === "/api/files/content" &&
          url.searchParams.get("path") === path,
        async (route) => {
          await content.promise;
          await route.continue();
        }
      );
    }

    try {
      await page.goto(`${origin}/en/browse/${path}`, {
        waitUntil: "domcontentloaded",
      });
      const breadcrumb = locationCrumb(page, filename);
      const listingPanel = page.locator('[data-slot="files-loading-panel"]');
      await expect(breadcrumb).toBeVisible();
      await expect(listingPanel).toBeVisible();
      const breadcrumbBounds = await breadcrumb.boundingBox();
      const listingBounds = await listingPanel.boundingBox();
      listing.resolve();

      const download = page.getByRole("link", {
        exact: true,
        name: "Download",
      });
      await expect(download).toBeVisible();
      const downloadBounds = await download.boundingBox();
      const pendingPreview = page.getByRole("status", {
        name: "Loading preview…",
      });
      const pendingBounds = hasTextPreview
        ? await pendingPreview.locator("..").boundingBox()
        : null;

      content.resolve();
      const panel = page.getByRole("main").locator(panelSelector);
      await expect(panel).toBeVisible();
      expect(await breadcrumb.boundingBox()).toEqual(breadcrumbBounds);
      expect(await download.boundingBox()).toEqual(downloadBounds);
      const panelBounds = await panel.boundingBox();
      expect(panelBounds?.y).toBe(listingBounds?.y);
      if (pendingBounds) {
        expect(panelBounds).toEqual(pendingBounds);
      }
    } finally {
      listing.resolve();
      content.resolve();
    }
  });
}

test("a slow folder README keeps loading inside its own panel", async ({
  page,
}) => {
  const release = Promise.withResolvers<void>();
  await page.route(
    (url) =>
      url.pathname === "/api/files/content" &&
      url.searchParams.get("path") === "README.md" &&
      url.searchParams.get("preview") === "1",
    async (route) => {
      await release.promise;
      await route.continue();
    }
  );

  await page.goto(`${origin}/en/browse`);
  const readme = page.getByRole("region", { name: "Folder README" });
  const loading = readme.getByRole("status", { name: "Loading preview…" });
  const selection = page.getByRole("checkbox", { name: "Select README.md" });
  try {
    await expect(locationCrumb(page, "All files")).toBeVisible();
    await expect(loading).toBeVisible();
    await selection.check();
    await expect(selection).toBeChecked();
  } finally {
    release.resolve();
  }

  await expect(
    readme.getByRole("heading", { name: "Public archive" })
  ).toBeVisible();
  await expect(loading).toHaveCount(0);
  await expect(selection).toBeChecked();
});

test("the files home redirects straight to the preferred language's listing", async ({
  request,
}) => {
  const response = await request.get(origin, {
    headers: { "Accept-Language": "ja" },
    maxRedirects: 0,
  });
  expect(response.status()).toBe(307);
  expect(new URL(response.headers().location, origin).pathname).toBe(
    "/ja/browse"
  );
});

test("a directly opened folder starts loading before JavaScript hydrates", async ({
  page,
}) => {
  const folder = "Documents";
  const release = Promise.withResolvers<void>();
  let reads = 0;
  page.on("request", (request) => {
    if (isBrowseRequest(new URL(request.url()), folder)) {
      reads += 1;
    }
  });
  await page.route(
    (url) =>
      url.pathname.startsWith("/_next/static/") && url.pathname.endsWith(".js"),
    async (route) => {
      await release.promise;
      await route.continue();
    }
  );
  try {
    const [listing] = await Promise.all([
      page.waitForResponse(
        (response) => isBrowseRequest(new URL(response.url()), folder),
        { timeout: 5000 }
      ),
      page.goto(`${origin}/en/browse/${folder}`, { waitUntil: "commit" }),
    ]);
    expect(listing.ok()).toBe(true);
  } finally {
    release.resolve();
  }

  await expect(directoryLink(page, guide)).toBeVisible();
  expect(reads).toBe(1);
});

test("opening a cold folder loads its data while the route is still pending", async ({
  page,
}) => {
  const folder = "Documents";
  const destination = `/en/browse/${folder}`;
  const release = Promise.withResolvers<void>();
  let reads = 0;
  page.on("request", (request) => {
    if (isBrowseRequest(new URL(request.url()), folder)) {
      reads += 1;
    }
  });
  await page.route(
    (url) => url.pathname.startsWith(destination),
    async (route) => {
      await release.promise;
      await route.continue();
    }
  );
  await page.goto(`${origin}/en/browse`);
  try {
    const [listing] = await Promise.all([
      page.waitForResponse(
        (response) => isBrowseRequest(new URL(response.url()), folder),
        { timeout: 5000 }
      ),
      page.getByRole("link", { exact: true, name: folder }).click(),
    ]);
    expect(listing.ok()).toBe(true);
  } finally {
    release.resolve();
  }

  await expect(page).toHaveURL(`${origin}${destination}`);
  await expect(directoryLink(page, guide)).toBeVisible();
  expect(reads).toBe(1);
});

test("an expired continuation restarts the folder listing", async ({
  page,
}) => {
  let expired = false;
  let restarted = false;
  await page.route(
    (url) => isBrowseRequest(url, ""),
    async (route) => {
      const isContinuation = new URL(route.request().url()).searchParams.has(
        "cursor"
      );
      if (isContinuation && !expired) {
        expired = true;
        await route.fulfill({ json: { error: "invalid-cursor" }, status: 400 });
        return;
      }
      restarted ||= expired && !isContinuation;
      await route.continue();
    }
  );

  await page.goto(origin);
  const more = page.getByRole("button", { name: "Load more" });
  await more.click();
  await expect.poll(() => restarted).toBe(true);
  await more.click();
  await expect(directoryLink(page, "Photo.png")).toBeVisible();
});

test("already visited nested folders and files open while their refresh is pending", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto(`${origin}/en/browse/${deepFolder}`);
  const fileLink = directoryLink(page, deepTitle);
  await fileLink.click();
  const preview = page.getByText("Nested public file fixture", { exact: true });
  await expect(preview).toBeVisible();

  await page.clock.fastForward(2100);
  const release = Promise.withResolvers<void>();
  await page.route(
    (url) => isBrowseRequest(url, deepFolder) || isBrowseRequest(url, deepFile),
    async (route) => {
      await release.promise;
      await route.continue();
    }
  );
  try {
    const folderRefresh = page.waitForRequest((request) =>
      isBrowseRequest(new URL(request.url()), deepFolder)
    );
    await page.getByRole("link", { exact: true, name: "Deep" }).click();
    await folderRefresh;
    await expect(fileLink).toBeVisible();

    const fileRefresh = page.waitForRequest((request) =>
      isBrowseRequest(new URL(request.url()), deepFile)
    );
    await page.goBack();
    await fileRefresh;
    await expect(preview).toBeVisible();
  } finally {
    release.resolve();
  }
});

test("returning focus refreshes the visible folder", async ({ page }) => {
  await page.clock.install();
  await page.goto(`${origin}/en/browse/${deepFolder}`);
  await expect(directoryLink(page, deepTitle)).toBeVisible();

  const name = "New public file.txt";
  await page.route(
    (url) => isBrowseRequest(url, deepFolder),
    async (route) => {
      const response = await route.fetch();
      const listing = await response.json();
      await route.fulfill({
        json: {
          ...listing,
          entries: [
            ...listing.entries,
            {
              kind: "file",
              name,
              path: [...deepFolder.split("/"), name],
              size: 42,
            },
          ],
        },
        response,
      });
    }
  );

  await page.clock.fastForward(5100);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(directoryLink(page, name)).toBeVisible();
});

test("the files host enforces a production CSP and loads its PDF engine locally", async ({
  page,
}) => {
  const response = await page.goto(`${origin}/en/browse/Documents/sample.pdf`);
  const csp = response?.headers()["content-security-policy"] ?? "";
  expect(csp).toContain("connect-src 'self'");
  expect(csp).not.toContain("'unsafe-eval'");
  await expect(locationCrumb(page, "sample.pdf")).toBeVisible();
  await expect(page.getByRole("button", { name: "Search text" })).toBeEnabled();
  const wasm = await page.request.get(`${origin}/assets/viewers/pdfium.wasm`);
  expect(wasm.status()).toBe(200);
  expect(wasm.headers()["content-type"]).toContain("application/wasm");
});

test("the spreadsheet viewer opens workbook sheets", async ({ page }) => {
  await page.setViewportSize({
    height: 640,
    width: page.viewportSize()?.width ?? 1024,
  });
  await page.goto(`${origin}/en/browse/Documents/sample.xlsx`);
  await expect(locationCrumb(page, "sample.xlsx")).toBeVisible();
  await expect(page.getByText("Reports", { exact: true })).toBeVisible();
  const sheet = page.getByRole("tab", { name: "Data", exact: true });
  const viewer = page.getByRole("region", { name: "sample.xlsx" });
  const [sheetBounds, viewerBounds] = await Promise.all([
    sheet.boundingBox(),
    viewer.boundingBox(),
  ]);
  expect(sheetBounds).not.toBeNull();
  expect(viewerBounds).not.toBeNull();
  if (sheetBounds && viewerBounds) {
    expect(sheetBounds.y + sheetBounds.height).toBeLessThanOrEqual(
      viewerBounds.y + viewerBounds.height
    );
  }
  await sheet.click();
  await expect(
    page.getByRole("grid", { name: "Data worksheet grid" })
  ).toBeVisible();

  await page.route(
    (url) =>
      url.pathname === "/api/files/content" &&
      url.searchParams.get("path") === "Documents/sample.xlsx",
    (route) => route.fulfill({ status: 503 })
  );
  await page.reload();
  await expect(page.getByText("Unable to display workbook")).toBeVisible();
  await expect(page.getByRole("button", { name: "Upload XLSX" })).toHaveCount(
    0
  );
});

test("Word and PowerPoint preview documents open read-only", async ({
  page,
}) => {
  await page.goto(`${origin}/en/browse/Documents/sample.docx`);
  await expect(locationCrumb(page, "sample.docx")).toBeVisible();
  await expect(
    page.getByText("OneDrive sample document", { exact: true })
  ).toBeVisible();
  await page.goto(`${origin}/en/browse/Documents/sample.pptx`);
  await expect(locationCrumb(page, "sample.pptx")).toBeVisible();
  await expect(
    page.getByText("Presentation fixture content", { exact: true })
  ).toBeVisible();
  const toggle = page.getByRole("button", { name: "Toggle thumbnails" });
  const sidebar = page.locator("[data-document-thumbnail-sidebar]");
  const thumbnails = sidebar.getByRole("listbox");
  await toggle.click();
  await expect(thumbnails).toBeVisible();
  await thumbnails.evaluate((listbox) => (listbox as HTMLElement).focus());
  await expect(thumbnails).toBeFocused();
  await toggle.click();
  await expect(sidebar).toHaveAttribute("inert", "");
  await thumbnails.evaluate((listbox) => (listbox as HTMLElement).focus());
  await expect(thumbnails).not.toBeFocused();
});
