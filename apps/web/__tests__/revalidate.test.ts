import { NextRequest } from "next/server";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { POST } from "../app/api/revalidate/route";

const { parseBody, revalidateTag } = vi.hoisted(() => ({
  parseBody: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("next-sanity/webhook", () => ({ parseBody }));
vi.mock("next/cache", () => ({ revalidateTag }));

const request = () =>
  new NextRequest("https://example.com/api/revalidate", { method: "POST" });

beforeEach(() => {
  parseBody.mockReset();
  revalidateTag.mockReset();
  vi.stubEnv("SANITY_REVALIDATE_SECRET", "test-webhook-secret");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

test("disables the webhook when the signing secret is missing", async () => {
  vi.stubEnv("SANITY_REVALIDATE_SECRET", "");
  expect((await POST(request())).status).toBe(503);
  expect(parseBody).not.toHaveBeenCalled();
  expect(revalidateTag).not.toHaveBeenCalled();
});

test("rejects invalid signatures without invalidating content", async () => {
  parseBody.mockResolvedValue({
    isValidSignature: false,
    body: { tags: ["post"] },
  });
  expect((await POST(request())).status).toBe(401);
  expect(revalidateTag).not.toHaveBeenCalled();
});

test("rejects a signed payload with no tags", async () => {
  parseBody.mockResolvedValue({ isValidSignature: true, body: {} });
  expect((await POST(request())).status).toBe(400);
});

test("revalidates only valid signed tags with the current Next.js cache API", async () => {
  parseBody.mockResolvedValue({
    isValidSignature: true,
    body: { tags: ["post", "", null, "post:test"] },
  });
  const response = await POST(request());
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ revalidated: ["post", "post:test"] });
  expect(revalidateTag.mock.calls).toEqual([
    ["post", "max"],
    ["post:test", "max"],
  ]);
});
