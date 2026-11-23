import { siteConfig } from "@repo/config/site";
import { config, withAnalyzer } from "@repo/next-config";
import type { NextConfig } from "next";
import { env } from "@/env";

const development = process.env.NODE_ENV === "development";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${development ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
].join("; ");

let nextConfig: NextConfig = {
  ...config,
  assetPrefix: siteConfig.files.assetPrefix,
  experimental: { ...config.experimental, globalNotFound: true },
  headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/((?!api(?:/|$)).*)",
        headers: [{ key: "Content-Security-Policy", value: csp }],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'none'; sandbox",
          },
        ],
      },
    ];
  },
};

if (env.ANALYZE === "true") {
  nextConfig = withAnalyzer(nextConfig);
}

export default nextConfig;
