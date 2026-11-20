import { unstable_doesMiddlewareMatch as doesProxyMatch } from "next/experimental/testing/server";
import { type NextFetchEvent, NextRequest } from "next/server";
import { beforeEach, expect, test, vi } from "vitest";
import proxy, { config } from "../proxy";

const { secure, env } = vi.hoisted(() => ({
  secure: vi.fn(),
  env: { ARCJET_KEY: "test-key" },
}));

vi.mock("@repo/security", () => ({ secure }));
vi.mock("@/env", () => ({ env }));
vi.mock("@repo/observability/error", () => ({
  parseError: (error: Error) => error.message,
}));

beforeEach(() => {
  secure.mockReset().mockResolvedValue(undefined);
  env.ARCJET_KEY = "test-key";
});

test.each([
  "/monitoring",
  "/monitoring?o=123",
  "/studio",
  "/api/revalidate",
  "/ingest/e",
  "/robots.txt",
  "/sitemap.xml",
  "/_next/static/app.js",
])(
  "keeps service endpoint %s outside locale rewriting and bot protection",
  (url) => {
    expect(doesProxyMatch({ config, url })).toBe(false);
  }
);

test.each(["/", "/en", "/en/blog/test"])("protects page route %s", (url) => {
  expect(doesProxyMatch({ config, url })).toBe(true);
});

test("preserves locale redirects and security headers after the Nemo migration", async () => {
  const response = await proxy(
    new NextRequest("https://example.com/"),
    {} as NextFetchEvent
  );
  expect(response?.headers.get("location")).toBe("https://example.com/en");
  expect(response?.headers.get("x-content-type-options")).toBe("nosniff");
});

test("returns 403 when bot protection denies a page", async () => {
  secure.mockRejectedValue(new Error("Access denied"));
  const response = await proxy(
    new NextRequest("https://example.com/en"),
    {} as NextFetchEvent
  );
  expect(response?.status).toBe(403);
  expect(response?.headers.get("x-content-type-options")).toBe("nosniff");
});

test("allows page requests when Arcjet is not configured", async () => {
  env.ARCJET_KEY = "";
  const response = await proxy(
    new NextRequest("https://example.com/en"),
    {} as NextFetchEvent
  );
  expect(response?.status).toBe(200);
  expect(secure).not.toHaveBeenCalled();
});
