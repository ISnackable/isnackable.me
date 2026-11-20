import { getBaseUrl } from "@repo/config/url";
import { expect, test } from "vitest";

test.each([
  ["example.vercel.app", "https://example.vercel.app/"],
  ["https://example.com", "https://example.com/"],
  ["http://localhost:3001", "http://localhost:3001/"],
  [undefined, "http://localhost:3001/"],
])("normalizes the site origin %s", (input, expected) => {
  expect(getBaseUrl(input).href).toBe(expected);
});

test("uses the application-specific public URL when no Vercel URL is set", () => {
  expect(getBaseUrl(undefined, "http://localhost:3000").href).toBe(
    "http://localhost:3000/"
  );
});
