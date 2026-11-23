import { type NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { expect, test, vi } from "vitest";
import proxy from "../proxy";

const { secure } = vi.hoisted(() => ({ secure: vi.fn() }));

vi.mock("@repo/internationalization/proxy", () => ({
  internationalizationMiddleware: () => NextResponse.next(),
}));
vi.mock("@repo/security", () => ({ secure }));
vi.mock("@/env", () => ({ env: { ARCJET_KEY: "test-key" } }));

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
});
