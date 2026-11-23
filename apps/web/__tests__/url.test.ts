import { siteConfig } from "@repo/config/site";
import { getBaseUrl } from "@repo/config/url";
import { locales } from "@repo/internationalization/locales";
import { expect, test } from "vitest";
import deployment from "../../../vercel.json";

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

test("routes the public Files paths and supported locales to the Files service", () => {
  const routes = deployment.rewrites
    .filter((rewrite) => rewrite.destination.service === "files")
    .map((rewrite) => rewrite.source);
  const { path, assetPrefix } = siteConfig.files;
  expect(routes).toEqual(
    expect.arrayContaining([
      `${path}/:path*`,
      `/:locale(${locales.join("|")})${path}/:path*`,
      `${assetPrefix}/:path*`,
      "/api/files/:path*",
    ])
  );
});
