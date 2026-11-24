import { unstable_doesMiddlewareMatch as doesProxyMatch } from "next/experimental/testing/server";
import { type NextFetchEvent, NextRequest } from "next/server";
import { beforeEach, expect, test, vi } from "vitest";
import proxy, { config } from "../proxy";

const { secure } = vi.hoisted(() => ({
  secure: vi.fn(),
}));

vi.mock("@repo/security", () => ({ secure }));

beforeEach(() => {
  secure.mockReset().mockResolvedValue(undefined);
});

test.each([
  "/monitoring",
  "/monitoring?o=123",
  "/studio",
  "/api/revalidate",
  "/api/draft-mode/enable",
  "/api/files/browse",
  "/files",
  "/ja/files/Documents",
  "/robots.txt",
  "/sitemap.xml",
  "/_next/static/app.js",
])(
  "keeps service endpoint %s outside locale rewriting and bot protection",
  (url) => {
    expect(doesProxyMatch({ config, url })).toBe(false);
  }
);

test.each(["/", "/en", "/en/blog/test", "/en/opengraph-image-ipmbgq"])(
  "protects portfolio route %s",
  (url) => {
    expect(doesProxyMatch({ config, url })).toBe(true);
  }
);

test.each(["/en", "/en/blog/test", "/en/blog/opengraph-image-explained"])(
  "allows search, archive, and social preview crawlers through Arcjet on %s",
  async (path) => {
    const request = new NextRequest(`https://example.com${path}`);
    await proxy(request, {} as NextFetchEvent);
    expect(secure).toHaveBeenCalledWith(
      expect.arrayContaining([
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:PREVIEW",
        "SLACK_CRAWLER",
        "LINKEDIN_CRAWLER",
        "VERCEL_CRAWLER",
        "ARCHIVEORG_ARCHIVER",
        "ANTHROPIC_CRAWLER_SEARCH",
        "PERPLEXITY_CRAWLER",
      ]),
      request
    );
  }
);

test.each([
  ["GET", "/en/opengraph-image-ipmbgq?fdeb1bbc9e0d5b4d"],
  ["HEAD", "/ja/blog/opengraph-image-wxbhp0"],
  ["GET", "/zh/blog/test/opengraph-image-9ollfa"],
  ["GET", "/en/projects/opengraph-image-ncbfcq"],
  ["GET", "/zh/projects/test/opengraph-image-k1fg2k"],
  ["GET", "/ja/resume/opengraph-image-1ujt2s"],
  ["GET", "/en/legal/test/opengraph-image-1hpjms"],
])("uses Shield without bot detection for %s %s", async (method, path) => {
  const request = new NextRequest(`https://example.com${path}`, { method });
  expect(doesProxyMatch({ config, url: path })).toBe(true);

  const response = await proxy(request, {} as NextFetchEvent);
  expect(secure).toHaveBeenCalledWith(null, request);
  expect(response?.headers.get("x-content-type-options")).toBe("nosniff");
});

test("keeps bot detection for writes to an image path", async () => {
  const request = new NextRequest(
    "https://example.com/en/opengraph-image-ipmbgq",
    { method: "POST" }
  );

  await proxy(request, {} as NextFetchEvent);
  expect(secure).toHaveBeenCalledWith(
    expect.arrayContaining(["CATEGORY:PREVIEW"]),
    request
  );
});

test.each(["GET", "HEAD"])(
  "lets the PDF handler apply its own protection for %s",
  async (method) => {
    const request = new NextRequest("https://example.com/ja/resume/pdf", {
      method,
    });

    const response = await proxy(request, {} as NextFetchEvent);

    expect(secure).not.toHaveBeenCalled();
    expect(response?.headers.get("x-content-type-options")).toBe("nosniff");
  }
);

test("preserves locale redirects and security headers for allowed requests", async () => {
  const response = await proxy(
    new NextRequest("https://example.com/"),
    {} as NextFetchEvent
  );
  expect(response?.headers.get("location")).toBe("https://example.com/en");
  expect(response?.headers.get("x-content-type-options")).toBe("nosniff");
});

test("returns a non-cacheable denial before locale routing", async () => {
  secure.mockResolvedValue(
    Response.json(
      { error: "denied" },
      { headers: { "Cache-Control": "private, no-store" }, status: 403 }
    )
  );
  const response = await proxy(
    new NextRequest("https://example.com/"),
    {} as NextFetchEvent
  );
  expect(response?.status).toBe(403);
  expect(await response?.json()).toEqual({ error: "denied" });
  expect(response?.headers.get("cache-control")).toBe("private, no-store");
  expect(response?.headers.get("location")).toBeNull();
  expect(response?.headers.get("x-middleware-next")).toBeNull();
  expect(response?.headers.get("x-middleware-rewrite")).toBeNull();
  expect(response?.headers.get("x-content-type-options")).toBe("nosniff");
});
