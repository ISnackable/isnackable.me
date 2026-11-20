import { getDynamicFetchOptions } from "@repo/cms/live";
import { beforeEach, expect, test, vi } from "vitest";

const { draftMode, cookies, connection, perspective, variant, token } =
  vi.hoisted(() => ({
    draftMode: vi.fn(),
    connection: vi.fn(),
    cookies: vi.fn(),
    perspective: vi.fn(),
    variant: vi.fn(),
    token: { value: "test-read-token" },
  }));

vi.mock("next/headers", () => ({ draftMode, cookies }));
vi.mock("next/server", () => ({ connection }));
vi.mock("@repo/cms/keys", () => ({
  keys: () => ({ SANITY_API_READ_TOKEN: token.value }),
}));
vi.mock("@repo/cms/client", () => ({
  client: { withConfig: () => ({}) },
}));
vi.mock("next-sanity/live", () => ({
  defineLive: () => ({ sanityFetch: vi.fn(), SanityLive: vi.fn() }),
  resolvePerspectiveFromCookies: perspective,
  resolveVariantFromCookies: variant,
}));

beforeEach(() => {
  vi.clearAllMocks();
  token.value = "test-read-token";
  draftMode.mockResolvedValue({ isEnabled: false });
  cookies.mockResolvedValue({});
  perspective.mockResolvedValue("drafts");
  variant.mockResolvedValue(undefined);
});

test("public queries cannot opt into draft content through fetch options", async () => {
  expect(await getDynamicFetchOptions({ perspective: "drafts" })).toEqual({
    perspective: "published",
    stega: false,
  });
  expect(cookies).not.toHaveBeenCalled();
  expect(connection).not.toHaveBeenCalled();
});

test("sitemap and slug reads bypass request-only APIs", async () => {
  expect(
    await getDynamicFetchOptions({ perspective: "published", stega: false })
  ).toEqual({ perspective: "published", stega: false, variant: undefined });
  expect(draftMode).not.toHaveBeenCalled();
  expect(cookies).not.toHaveBeenCalled();
  expect(connection).not.toHaveBeenCalled();
});

test("draft previews carry their perspective and stega into a separate cache key", async () => {
  const published = await getDynamicFetchOptions();
  draftMode.mockResolvedValue({ isEnabled: true });
  const preview = await getDynamicFetchOptions();
  expect(published).toEqual({ perspective: "published", stega: false });
  expect(preview).toEqual({
    perspective: "drafts",
    stega: true,
    variant: undefined,
  });
  expect(preview).not.toEqual(published);
  expect(connection).toHaveBeenCalledOnce();
});

test("release previews preserve the cookie perspective and content variant", async () => {
  draftMode.mockResolvedValue({ isEnabled: true });
  perspective.mockResolvedValue(["release-a", "drafts"]);
  variant.mockResolvedValue("variant-a");
  expect(await getDynamicFetchOptions()).toEqual({
    perspective: ["release-a", "drafts"],
    variant: "variant-a",
    stega: true,
  });
});

test("preview metadata keeps draft perspective without stega characters", async () => {
  draftMode.mockResolvedValue({ isEnabled: true });
  expect(await getDynamicFetchOptions({ stega: false })).toEqual({
    perspective: "drafts",
    variant: undefined,
    stega: false,
  });
});

test("a preview session without a read token falls back to published content", async () => {
  token.value = "";
  draftMode.mockResolvedValue({ isEnabled: true });
  vi.resetModules();
  const { getDynamicFetchOptions: withoutToken } = await import(
    "@repo/cms/live"
  );
  expect(await withoutToken()).toEqual({
    perspective: "published",
    stega: false,
  });
  expect(cookies).not.toHaveBeenCalled();
  expect(connection).not.toHaveBeenCalled();
});
