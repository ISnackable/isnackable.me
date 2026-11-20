import { afterEach, expect, test, vi } from "vitest";
import { fetchContributions } from "../lib/contributions";

afterEach(() => vi.unstubAllGlobals());

test("returns validated contribution data for the requested year", async () => {
  const contributions = [{ date: "2026-01-01", count: 3, level: 2 }];
  const request = vi
    .fn()
    .mockResolvedValue(Response.json({ contributions, total: { 2026: 3 } }));
  vi.stubGlobal("fetch", request);

  expect(await fetchContributions("example-user", 2026)).toEqual({
    contributions,
    total: 3,
  });
  expect(String(request.mock.calls[0][0])).toBe(
    "https://github-contributions-api.jogruber.de/v4/example-user?y=2026"
  );
});

test("preserves an empty year without inventing contributions", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(Response.json({ contributions: [], total: {} }))
  );
  expect(await fetchContributions("example-user", 2026)).toEqual({
    contributions: [],
    total: 0,
  });
});

test("rejects an HTTP error before treating it as contribution data", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json({ error: "Unavailable" }, { status: 503 })
      )
  );
  await expect(fetchContributions("example-user", 2026)).rejects.toThrow("503");
});

test("rejects an invalid successful response", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(Response.json({ error: "User not found" }))
  );
  await expect(fetchContributions("example-user", 2026)).rejects.toThrow();
});
