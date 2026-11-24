// @vitest-environment node
import { formatFileSize } from "@repo/design-system/components/extend/file-format";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { POST as downloadArchive } from "@/app/api/files/archive/route";
import { GET } from "@/app/api/files/browse/route";
import { resolveEntry } from "@/lib/files/access";
import { serveFileRequest } from "@/lib/files/content";
import { readCursor, sealCursor } from "@/lib/files/cursor";
import type { GraphItem } from "@/lib/files/graph";
import { readArchivePaths } from "@/lib/files/http";
import { archiveEntryLimit, archiveSelectionLimit } from "@/lib/files/limits";
import {
  browseHref,
  filesApiHref,
  readBrowsePath,
  readFilePath,
} from "@/lib/files/paths";
import { previewType, shortcutUrl } from "@/lib/files/preview";
import type { BrowsePage } from "@/lib/files/types";

const drive = {
  accessToken: () => "fixture-access-token",
  connectionId: "760779e6-ee5d-4149-9c24-d896ca371115",
  contentHosts: new Set(["content.fixture.test"]),
  driveId: "fixture-drive",
  rootId: "public-root",
  rootPath: ["Public", "Shared"],
};
const network = vi.fn<typeof fetch>();
const secure = vi.hoisted(() => vi.fn());
const scheduleAfter = vi.hoisted(() =>
  vi.fn<(work: () => Promise<void>) => void>()
);
const listingCache = {
  eval: vi.fn<
    (script: string, keys: string[], args: unknown[]) => Promise<number>
  >(),
  get: vi.fn<(key: string) => Promise<unknown>>(),
  set: vi.fn<
    (
      key: string,
      value: unknown,
      options: { ex: number; nx?: boolean }
    ) => Promise<string | null>
  >(),
};

vi.mock("next/server", async (load) => ({
  ...(await load<typeof import("next/server")>()),
  after: scheduleAfter,
}));
vi.mock("server-only", () => ({}));
vi.mock("@repo/security", () => ({ secure }));
vi.mock("@/env", () => ({
  env: {
    FILES_BASE_DIRECTORY: "Public/Shared",
    FILES_CLIENT_ID: "fixture-client",
    FILES_CLIENT_SECRET: "fixture-client-secret",
    FILES_SIGNING_SECRET: "fixture-signing-key",
    NEXT_PUBLIC_WEB_URL: "https://portfolio.example.test",
  },
}));
vi.mock("@/lib/files/connection", () => ({
  openPublishedDrive: () => Promise.resolve(drive),
}));
vi.mock("@/lib/files/redis", () => ({
  requireFilesRedis: () => listingCache,
}));

function folder(
  id: string,
  parent: string,
  parentPath: string,
  name = id
): GraphItem {
  return {
    folder: {},
    id,
    name,
    parentReference: {
      driveId: drive.driveId,
      id: parent,
      path: `/drive/root:/${parentPath}`,
    },
  };
}

function browse(...path: string[]) {
  return new NextRequest(
    new URL(filesApiHref("browse", path), "https://files.example.test")
  );
}

beforeEach(() => {
  network.mockReset();
  secure.mockReset().mockResolvedValue(undefined);
  scheduleAfter.mockReset();
  listingCache.eval.mockReset().mockResolvedValue(1);
  listingCache.get.mockReset().mockResolvedValue(null);
  listingCache.set.mockReset().mockResolvedValue("OK");
  vi.stubGlobal("fetch", network);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test.each([
  ["en", "1.5"],
  ["ja", "1.5"],
  ["zh", "1.5"],
  ["de", "1,5"],
])(
  "uses consistent byte units with a localized number in %s",
  (locale, decimal) => {
    const sizes = [0, 1500, 1_500_000, 1_500_000_000, 1_500_000_000_000];

    expect(sizes.map((size) => formatFileSize(size, locale))).toEqual([
      "0\u00a0B",
      `${decimal}\u00a0kB`,
      `${decimal}\u00a0MB`,
      `${decimal}\u00a0GB`,
      `${decimal}\u00a0TB`,
    ]);
  }
);

test("filename links encode spaces, Unicode, and literal percent and hash characters exactly once", () => {
  const path = ["資料", "50% #1 + text.txt"];
  const href = browseHref("ja", path);
  const api = new URL(
    filesApiHref("content", path),
    "https://files.example.test"
  );
  expect(href).toBe(
    "/ja/files/%E8%B3%87%E6%96%99/50%25%20%231%20%2B%20text.txt"
  );
  expect(readFilePath(api.searchParams.get("path"))).toEqual(path);
  expect(readBrowsePath(href.split("/").slice(3))).toEqual(path);
  expect(readBrowsePath(["literal%252F.txt"])).toEqual(["literal%2F.txt"]);
  expect(readBrowsePath(["encoded%2Fslash.txt"])).toBeNull();
  expect(readFilePath("literal%2F.txt")).toEqual(["literal%2F.txt"]);
});

test.each(["..", "a//b", "a/../b", "/absolute", ".PASSWORD", "a\\b"])(
  "rejects unsafe path %s",
  (path) => {
    expect(readFilePath(path)).toBeNull();
  }
);

test("archive requests accept the full selection limit with long Unicode paths", async () => {
  const folderName = "界".repeat(255);
  const pathPrefix = [folderName, folderName, folderName];
  const paths = Array.from({ length: archiveSelectionLimit }, (_, index) => [
    ...pathPrefix,
    `${"文".repeat(252)}${String(index).padStart(3, "0")}`,
  ]);
  const form = new URLSearchParams(
    paths.map((path) => ["path", path.join("/")])
  );
  const request = new Request("https://files.example.test/api/files/archive", {
    body: form.toString(),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  });
  await expect(readArchivePaths(request)).resolves.toEqual(paths);
});

test("rate limited archive requests stop before reading paths or calling Graph", async () => {
  secure.mockResolvedValue(
    Response.json({ error: "rate-limited" }, { status: 429 })
  );
  const request = new NextRequest(
    "https://files.example.test/api/files/archive",
    {
      method: "POST",
      body: new URLSearchParams({ path: "Documents" }),
    }
  );

  const response = await downloadArchive(request);

  expect(secure).toHaveBeenCalledExactlyOnceWith(
    ["CATEGORY:PREVIEW"],
    request,
    {
      requestsPerMinute: 5,
    }
  );
  expect(response.status).toBe(429);
  expect(request.bodyUsed).toBe(false);
  expect(network).not.toHaveBeenCalled();
});

test("an oversized nested folder fails before the server starts streaming a ZIP", async () => {
  network
    .mockResolvedValueOnce(
      Response.json(
        folder("documents", drive.rootId, "Public/Shared", "Documents")
      )
    )
    .mockResolvedValueOnce(
      Response.json({
        value: [
          folder("nested", "documents", "Public/Shared/Documents", "Nested"),
        ],
      })
    )
    .mockResolvedValueOnce(
      Response.json({
        value: Array.from({ length: archiveEntryLimit }, (_, index) => ({
          file: {},
          id: `file-${index}`,
          name: `file-${index}.txt`,
          parentReference: {
            driveId: drive.driveId,
            id: "nested",
            path: "/drive/root:/Public/Shared/Documents/Nested",
          },
        })),
      })
    );

  const response = await downloadArchive(
    new NextRequest("https://files.example.test/api/files/archive", {
      body: new URLSearchParams({ path: "Documents" }),
      headers: {
        Origin: "https://portfolio.example.test",
        "Sec-Fetch-Site": "same-origin",
      },
      method: "POST",
    })
  );
  expect(response.status).toBe(413);
  expect(response.headers.get("Content-Disposition")).toBeNull();
  await expect(response.json()).resolves.toEqual({ error: "archive-limit" });
  expect(network).toHaveBeenCalledTimes(3);
});

test.each([
  ["Public", 200, { entries: [{ name: "Docs" }], kind: "folder" }],
  ["Private", 503, { error: "unconfigured" }],
] as const)(
  "the root starts listing during verification and responds correctly under %s",
  async (parent, status, body) => {
    network
      .mockImplementationOnce(async () => {
        await vi.waitFor(() => expect(network).toHaveBeenCalledTimes(2));
        return Response.json(folder(drive.rootId, "parent", parent, "Shared"));
      })
      .mockResolvedValueOnce(
        Response.json({
          value: [folder("docs", drive.rootId, "Public/Shared", "Docs")],
        })
      );
    const response = await GET(browse());
    expect(network.mock.calls[1]?.[0]).toHaveProperty(
      "pathname",
      "/v1.0/drives/fixture-drive/items/public-root/children"
    );
    expect(response.status).toBe(status);
    expect(await response.json()).toMatchObject(body);
  }
);

test("a cold deep folder uses one lookup and one listing and returns only verified children", async () => {
  const nextLink =
    "https://graph.microsoft.com/v1.0/drives/fixture-drive/items/deep/children?$skiptoken=fixture";
  network
    .mockResolvedValueOnce(
      Response.json(folder("deep", "docs", "Public/Shared/Docs", "Deep"))
    )
    .mockResolvedValueOnce(
      Response.json({
        "@odata.nextLink": nextLink,
        value: [
          folder("allowed", "deep", "Public/Shared/Docs/Deep"),
          folder("wrong-parent-id", "docs", "Public/Shared/Docs/Deep"),
          folder("wrong-parent-path", "deep", "Public/Shared/Docs/Other"),
          folder("password", "deep", "Public/Shared/Docs/Deep", ".password"),
          {
            ...folder("shortcut", "deep", "Public/Shared/Docs/Deep"),
            remoteItem: {},
          },
        ],
      })
    );

  const response = await GET(browse("Docs", "Deep"));
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toContain("no-store");
  const { entries, nextCursor } = await response.json();
  expect(entries).toEqual([
    { kind: "folder", name: "allowed", path: ["Docs", "Deep", "allowed"] },
  ]);
  expect(nextCursor).not.toContain("graph.microsoft.com");
  expect(readCursor(drive.connectionId, "deep", nextCursor)).toBe(nextLink);
  expect(network.mock.calls.map(([url]) => String(url).split("?")[0])).toEqual([
    "https://graph.microsoft.com/v1.0/drives/fixture-drive/items/public-root:/Docs/Deep",
    "https://graph.microsoft.com/v1.0/drives/fixture-drive/items/deep/children",
  ]);
});

test("a cold file lookup returns canonical metadata without asking for download credentials", async () => {
  const { folder: _folder, ...item } = folder(
    "file",
    "docs",
    "Public/Shared/Docs",
    "50% Ready.txt"
  );
  network.mockResolvedValueOnce(
    Response.json({ ...item, file: {}, size: 123 })
  );

  const response = await GET(browse("docs", "50% ready.txt"));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    entry: {
      kind: "file",
      name: "50% Ready.txt",
      path: ["Docs", "50% Ready.txt"],
      size: 123,
    },
    kind: "file",
  });
  expect(network).toHaveBeenCalledTimes(1);
  expect(String(network.mock.calls[0]?.[0])).not.toContain("downloadUrl");
});

test("repeat visits reuse only the verified first page for this connection", async () => {
  network
    .mockResolvedValueOnce(
      Response.json(folder(drive.rootId, "parent", "Public", "Shared"))
    )
    .mockResolvedValueOnce(
      Response.json({
        value: [folder("docs", drive.rootId, "Public/Shared", "Docs")],
      })
    );
  const first = await GET(browse());
  expect(first.status).toBe(200);
  const page: BrowsePage = await first.json();
  const [key, snapshot] = listingCache.set.mock.calls[0] ?? [];
  expect(key).toContain(drive.connectionId);
  expect(snapshot).toEqual({ freshUntil: expect.any(Number), page });
  expect(listingCache.set).toHaveBeenCalledWith(key, snapshot, {
    ex: 30,
    nx: true,
  });

  listingCache.get.mockResolvedValueOnce(snapshot);
  expect(await (await GET(browse())).json()).toEqual(page);
  expect(listingCache.get).toHaveBeenLastCalledWith(key);
  expect(network).toHaveBeenCalledTimes(2);
  expect(listingCache.set).toHaveBeenCalledTimes(1);
  expect(scheduleAfter).not.toHaveBeenCalled();
});

const cachedRoot: BrowsePage = {
  entries: [],
  entry: { kind: "folder", name: "Shared", path: [] },
  kind: "folder",
  nextCursor: null,
};

test("stale requests get the listing before the shared background refresh runs", async () => {
  const freshUntil = Date.now() - 5000;
  listingCache.get.mockResolvedValue({ freshUntil, page: cachedRoot });
  listingCache.set.mockResolvedValueOnce("OK").mockResolvedValueOnce(null);
  network
    .mockResolvedValueOnce(
      Response.json(folder(drive.rootId, "parent", "Public", "Shared"))
    )
    .mockResolvedValueOnce(
      Response.json({
        value: [folder("docs", drive.rootId, "Public/Shared", "Docs")],
      })
    );
  const responses = await Promise.all([GET(browse()), GET(browse())]);
  await expect(
    Promise.all(responses.map((response) => response.json()))
  ).resolves.toEqual([cachedRoot, cachedRoot]);
  expect(network).not.toHaveBeenCalled();

  await Promise.all(scheduleAfter.mock.calls.map(([work]) => work()));
  expect(listingCache.set).toHaveBeenCalledTimes(2);
  expect(listingCache.set.mock.calls[0]).toEqual(
    listingCache.set.mock.calls[1]
  );
  expect(listingCache.set.mock.calls[0]?.[2]).toEqual({ ex: 30, nx: true });
  expect(network).toHaveBeenCalledTimes(2);
  expect(listingCache.eval).toHaveBeenCalledTimes(1);
  const [, keys, args] = listingCache.eval.mock.calls[0] ?? [];
  expect(keys).toEqual([listingCache.get.mock.calls[0]?.[0]]);
  expect(args?.[0]).toBe(freshUntil);
  expect(args?.[2]).toBe(30);
  expect(JSON.parse(String(args?.[1]))).toMatchObject({
    page: { entries: [{ name: "Docs" }] },
  });
});

test("a refresh failure leaves the original expiration and hard-expired pages wait for Graph", async () => {
  listingCache.get.mockResolvedValue({
    freshUntil: Date.now() - 5000,
    page: cachedRoot,
  });
  network.mockRejectedValue(new Error("Graph is offline"));
  expect(await (await GET(browse())).json()).toEqual(cachedRoot);
  await Promise.all(scheduleAfter.mock.calls.map(([work]) => work()));
  expect(listingCache.eval).not.toHaveBeenCalled();

  scheduleAfter.mockClear();
  listingCache.get.mockResolvedValue({
    freshUntil: Date.now() - 15_000,
    page: cachedRoot,
  });
  const expired = await GET(browse());
  expect(expired.status).toBe(503);
  expect(scheduleAfter).not.toHaveBeenCalled();
});

test("Internet shortcuts preserve query parameters and reject active URLs", () => {
  expect(
    shortcutUrl("[InternetShortcut]\r\nURL=https://example.test/?a=b&c=d\r\n")
  ).toBe("https://example.test/?a=b&c=d");
  expect(shortcutUrl("URL=javascript:alert(1)")).toBeNull();
  expect(shortcutUrl("URL=https://user:pass@example.test")).toBeNull();
  expect(previewType("Page.URL").kind).toBe("link");
});

test("a file preview uses the signed URL from the metadata response", async () => {
  const location = "https://content.fixture.test/file/sample";
  const { folder: _folder, ...item } = folder(
    "sample",
    drive.rootId,
    "Public/Shared",
    "Sample.txt"
  );
  network
    .mockResolvedValueOnce(
      Response.json({
        ...item,
        "@microsoft.graph.downloadUrl": location,
        file: {},
        size: 5,
      })
    )
    .mockResolvedValueOnce(new Response("hello"));

  const url = new URL(
    filesApiHref("content", ["Sample.txt"], { preview: "1" }),
    "https://files.example.test"
  );
  const response = await serveFileRequest(new Request(url));
  expect(response.status).toBe(200);
  expect(await response.text()).toBe("hello");
  expect(network).toHaveBeenCalledTimes(2);
  const [metadata, content] = network.mock.calls;
  expect(new URL(String(metadata?.[0])).searchParams.get("select")).toContain(
    "@microsoft.graph.downloadUrl"
  );
  expect(String(content?.[0])).toBe(location);
  expect(response.headers.has("location")).toBe(false);
});

test.each([undefined, null])(
  "download falls back to Graph's content endpoint when metadata has no URL (%j)",
  async (downloadUrl) => {
    const { folder: _folder, ...item } = folder(
      "file-id",
      "docs",
      "Public/Shared/Docs",
      "Sample.txt"
    );
    const location = "https://content.fixture.test/file/sample";
    network
      .mockResolvedValueOnce(
        Response.json({
          ...item,
          "@microsoft.graph.downloadUrl": downloadUrl,
          file: {},
          size: 10,
        })
      )
      .mockResolvedValueOnce(Response.redirect(location))
      .mockResolvedValueOnce(
        new Response("hello", {
          headers: { "Content-Range": "bytes 0-4/10" },
          status: 206,
        })
      );

    const url = new URL(
      filesApiHref("content", ["Docs", "Sample.txt"]),
      "https://files.example.test"
    );
    const response = await serveFileRequest(
      new Request(url, { headers: { Range: "bytes=0-4" } })
    );

    expect(response.status).toBe(206);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("content-range")).toBe("bytes 0-4/10");
    expect(await response.text()).toBe("hello");
    expect(network).toHaveBeenCalledTimes(3);
    const [metadata, download, content] = network.mock.calls;
    expect(metadata?.[0]).toHaveProperty(
      "pathname",
      "/v1.0/drives/fixture-drive/items/public-root:/Docs/Sample.txt"
    );
    expect(download?.[0]).toHaveProperty(
      "pathname",
      "/v1.0/drives/fixture-drive/items/file-id/content"
    );
    expect(download?.[1]).toMatchObject({
      headers: { Authorization: "Bearer fixture-access-token" },
      redirect: "manual",
    });
    expect(String(content?.[0])).toBe(location);
    const contentHeaders = new Headers(content?.[1]?.headers);
    expect(contentHeaders.get("authorization")).toBeNull();
    expect(contentHeaders.get("range")).toBe("bytes=0-4");
  }
);

test.each([
  folder("docs", "root", "Private", "Docs"),
  folder("docs", "root", "Public/Shared-copy", "Docs"),
  folder("docs", "root", "Public/Shared/Elsewhere", "Docs"),
  { ...folder("docs", "root", "Public/Shared", "Docs"), remoteItem: {} },
  {
    ...folder("docs", "root", "Public/Shared", "Docs"),
    parentReference: {
      driveId: "different-drive",
      path: "/drive/root:/Public/Shared",
    },
  },
])("an unverified entry cannot be listed or resolved (%j)", async (item) => {
  network.mockResolvedValueOnce(Response.json(item));
  await expect(resolveEntry(drive, ["Docs"])).rejects.toThrow("missing");
  expect(network).toHaveBeenCalledTimes(1);
});

test.each([
  folder("other-id", "parent", "Public", "Shared"),
  folder(drive.rootId, "parent", "Archive/Public", "Shared"),
])("rejects a moved or replaced publish folder (%j)", async (item) => {
  network.mockResolvedValueOnce(Response.json(item));
  await expect(resolveEntry(drive, [])).rejects.toThrow("unconfigured");
  expect(network).toHaveBeenCalledTimes(1);
});

test("invalidates tampered, cross-folder, cross-connection, and expired cursors", () => {
  const now = 1_800_000_000_000;
  const timestamp = vi.spyOn(Date, "now").mockReturnValue(now);
  const id = drive.connectionId;
  try {
    const cursor = sealCursor(id, "folder", "https://graph.microsoft.com/next");
    expect(() => readCursor(id, "other", cursor)).toThrow("invalid-cursor");
    expect(() => readCursor("other", "folder", cursor)).toThrow(
      "invalid-cursor"
    );
    expect(() => readCursor(id, "folder", `z${cursor}`)).toThrow(
      "invalid-cursor"
    );
    timestamp.mockReturnValue(now + 3_600_001);
    expect(() => readCursor(id, "folder", cursor)).toThrow("invalid-cursor");
  } finally {
    timestamp.mockRestore();
  }
});

test("the browse API rejects a cursor from another folder without reading its page", async () => {
  network.mockResolvedValueOnce(
    Response.json(folder("docs", "root", "Public/Shared", "Docs"))
  );
  const url = new URL(browse("Docs").url);
  url.searchParams.set(
    "cursor",
    sealCursor(
      drive.connectionId,
      "elsewhere",
      "https://graph.microsoft.com/next"
    )
  );
  const response = await GET(new NextRequest(url));
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ error: "invalid-cursor" });
  expect(network).toHaveBeenCalledTimes(1);
});

test("Office formats select their dedicated viewers, and active content is never an inline media type", () => {
  expect(previewType("Workbook.XLSX")).toMatchObject({
    format: "xlsx",
    kind: "document",
  });
  expect(previewType("page.html").kind).toBe("text");
  expect(previewType("drawing.svg").kind).toBe("unknown");
});
