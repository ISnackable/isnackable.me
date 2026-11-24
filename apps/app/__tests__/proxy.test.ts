import { type NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { beforeEach, expect, test, vi } from "vitest";
import proxy from "../proxy";

const { localize, secure } = vi.hoisted(() => ({
  localize: vi.fn(),
  secure: vi.fn(),
}));

vi.mock("@repo/internationalization/proxy", () => ({
  internationalizationMiddleware: localize,
}));
vi.mock("@repo/security", () => ({ secure }));

beforeEach(() => {
  localize.mockReset().mockImplementation(() => NextResponse.next());
  secure.mockReset().mockResolvedValue(undefined);
});

test("allows the shared link preview crawlers on Files pages", async () => {
  const request = new NextRequest("https://example.com/en/files/Documents");

  await proxy(request, {} as NextFetchEvent);

  expect(secure).toHaveBeenLastCalledWith(
    ["CATEGORY:PREVIEW", "SLACK_CRAWLER", "LINKEDIN_CRAWLER", "VERCEL_CRAWLER"],
    request
  );
});

test("uses the preview category policy on Files API requests", async () => {
  const request = new NextRequest("https://example.com/api/files/browse");

  await proxy(request, {} as NextFetchEvent);

  expect(secure).toHaveBeenLastCalledWith(["CATEGORY:PREVIEW"], request);
  expect(localize).not.toHaveBeenCalled();
});

test("lets the archive handler apply its own protection", async () => {
  const request = new NextRequest("https://example.com/api/files/archive", {
    method: "POST",
  });

  const response = await proxy(request, {} as NextFetchEvent);

  expect(response?.headers.get("x-middleware-next")).toBe("1");
  expect(secure).not.toHaveBeenCalled();
  expect(localize).not.toHaveBeenCalled();
});

test("returns a non-cacheable denial before localizing a blocked Files page", async () => {
  const request = new NextRequest("https://example.com/en/files/Documents");
  secure.mockResolvedValue(
    Response.json(
      { error: "denied" },
      { headers: { "Cache-Control": "private, no-store" }, status: 403 }
    )
  );

  const response = await proxy(request, {} as NextFetchEvent);

  expect(response?.status).toBe(403);
  expect(response?.headers.get("cache-control")).toBe("private, no-store");
  expect(localize).not.toHaveBeenCalled();
});
