import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { expect, test } from "@playwright/test";

const origin = "http://127.0.0.1:3100";
const file = (path: string, endpoint = "content") =>
  `${origin}/api/files/${endpoint}?${new URLSearchParams({ path })}`;
const downloads = /attachment/;
const privateCache = /no-store/;
const japanese = /日本語/;
const guide = "Guide.txt";
const guideSearchMatch = /^Guide\.txt\s/;
const zipStart = 0x04_03_4b_50;
const zipEnd = 0x06_05_4b_50;

function expectArchive(bytes: Buffer, ...entries: string[]) {
  expect(bytes.readUInt32LE(0)).toBe(zipStart);
  expect(bytes.readUInt32LE(bytes.length - 22)).toBe(zipEnd);
  for (const name of entries) {
    expect(bytes.includes(Buffer.from(name))).toBe(true);
  }
}

test("browse, page forward, follow a file link and return to the folder", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(origin);
  await expect(page).toHaveURL(`${origin}/en/browse`);
  await expect(page.getByRole("heading", { name: "All files" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Public archive" })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Portfolio" })).toBeVisible();

  await page.getByRole("button", { name: "Load more" }).click();
  await expect(
    page.getByRole("link", { exact: true, name: "Photo.png" })
  ).toBeVisible();
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
  await page
    .getByRole("link", { name: "50% ready #1.txt", exact: true })
    .click();
  await expect(page).toHaveURL(`${origin}/en/browse/50%25%20ready%20%231.txt`);
  const textPreview = page.getByRole("main").getByRole("code");
  await expect(textPreview).toHaveText("Unicode test: 資料");
  await page.reload();
  await expect(textPreview).toHaveText("Unicode test: 資料");
  await page.goBack();
  await expect(page.getByRole("heading", { name: "All files" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Grid view" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(page.getByRole("table")).toHaveCount(0);
  expect(errors).toEqual([]);
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
    await expect(
      page.getByRole("heading", { name: "50% ready #1.txt" })
    ).toBeVisible();
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
    await expect(
      page.getByRole("link", { name: "すべてのファイル" })
    ).toBeVisible();
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
    await expect(page.getByRole("link", { name: "所有文件" })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("page links and direct bytes support sharing, embeds, and ranges", async ({
  page,
}) => {
  await page.goto(`${origin}/en/browse/Documents/Guide.txt`);
  await expect(page.getByText("Public file fixture")).toBeVisible();
  await page
    .context()
    .grantPermissions(["clipboard-read", "clipboard-write"], { origin });
  await page.getByRole("button", { name: "Copy link", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(`${origin}/en/browse/Documents/Guide.txt`);
  await page.getByRole("button", { name: "Copy direct link" }).click();
  const directLink = file("Documents/Guide.txt");
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(directLink);
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
  await expect(
    page.getByRole("link", { exact: true, name: guide })
  ).toBeVisible();
  await page.getByRole("button", { name: "Select", exact: true }).click();
  await page.getByRole("checkbox", { name: "Select Guide.txt" }).check();
  const pendingFile = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download selected" }).click();
  expect((await pendingFile).suggestedFilename()).toBe("Guide.txt");
  await page.getByRole("checkbox", { name: "Select sample.pdf" }).check();
  await page
    .context()
    .grantPermissions(["clipboard-read", "clipboard-write"], { origin });
  await page.getByRole("button", { name: "Copy selected links" }).click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(
      [file("Documents/Guide.txt"), file("Documents/sample.pdf")].join("\n")
    );
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download selected" }).click();
  const selection = await pending;
  expect(selection.suggestedFilename()).toBe("Documents.zip");
  const selected = await readFile(await selection.path());
  expectArchive(selected, "Guide.txt", "sample.pdf", "Public file fixture");
  expect(selected.includes(Buffer.from("sample.docx"))).toBe(false);

  await page.getByRole("button", { name: "Cancel selection" }).click();
  const pendingFolder = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download folder as ZIP" }).click();
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

test("scoped OneDrive search finds public files and excludes outside results", async ({
  page,
}) => {
  await page.goto(`${origin}/en/browse`);
  const search = page.getByRole("button", {
    exact: true,
    name: "Search files",
  });
  const dialog = page.getByRole("dialog", { name: "Search files" });
  const query = dialog.getByRole("searchbox", { name: "Search files" });
  await search.click();
  await query.fill("Guide");
  const match = dialog.getByRole("link", { name: guideSearchMatch });
  await expect(match).toBeVisible();
  await expect(page).toHaveURL(`${origin}/en/browse`);
  await match.click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText("Public file fixture")).toBeVisible();
  const started = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download" }).click();
  const download = await started;
  expect(download.suggestedFilename()).toBe("Guide.txt");
  expect(await readFile(await download.path(), "utf8")).toBe(
    "Public file fixture"
  );

  await search.click();
  await query.fill("private-notes");
  await expect(dialog.getByText("No matching items.")).toBeVisible();
  await query.press("Enter");
  await expect(page).toHaveURL(`${origin}/en/search?q=private-notes`);
  await expect(
    page.getByRole("main").getByText("No matching items.")
  ).toBeVisible();
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

  await expect(
    page.getByRole("link", { exact: true, name: guide })
  ).toBeVisible();
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
  await expect(
    page.getByRole("link", { exact: true, name: guide })
  ).toBeVisible();
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
  await expect(
    page.getByRole("link", { exact: true, name: "Photo.png" })
  ).toBeVisible();
});

test("already visited nested folders and files open while their refresh is pending", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto(`${origin}/en/browse/${deepFolder}`);
  const fileLink = page.getByRole("link", { exact: true, name: deepTitle });
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
  await expect(
    page.getByRole("link", { exact: true, name: deepTitle })
  ).toBeVisible();

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
  await expect(page.getByRole("link", { exact: true, name })).toBeVisible();
});

test("the files host enforces a production CSP and loads its PDF engine locally", async ({
  page,
}) => {
  const response = await page.goto(`${origin}/en/browse/Documents/sample.pdf`);
  const csp = response?.headers()["content-security-policy"] ?? "";
  expect(csp).toContain("connect-src 'self'");
  expect(csp).not.toContain("'unsafe-eval'");
  await expect(page.getByRole("heading", { name: "sample.pdf" })).toBeVisible();
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
  await expect(
    page.getByRole("heading", { name: "sample.xlsx" })
  ).toBeVisible();
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
  await expect(
    page.getByRole("heading", { name: "sample.docx" })
  ).toBeVisible();
  await expect(
    page.getByText("OneDrive sample document", { exact: true })
  ).toBeVisible();
  await page.goto(`${origin}/en/browse/Documents/sample.pptx`);
  await expect(
    page.getByRole("heading", { name: "sample.pptx" })
  ).toBeVisible();
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
