import { withCMS } from "@repo/cms/next-config";
import { siteConfig } from "@repo/config/site";
import { locales } from "@repo/internationalization/locales";
import { withInternationalization } from "@repo/internationalization/next-config";
import { config, withAnalyzer } from "@repo/next-config";
import { withSentry } from "@repo/observability/next-config";
import type { NextConfig } from "next";
import { env } from "@/env";

const studioRewrites = [
  {
    source: "/studio{/}?",
    destination: "http://127.0.0.1:3333/studio/",
  },
  {
    source: "/studio/:path+",
    destination: "http://127.0.0.1:3333/studio/:path+",
  },
];

function localFilesRewrites() {
  const filesUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : env.FILES_BROWSER_TEST_ORIGIN;
  if (!filesUrl) {
    return [];
  }

  const origin = new URL(filesUrl).origin;
  const filesPath = `${siteConfig.files.path}/:path*`;
  const assetsPath = `${siteConfig.files.assetPrefix}/:path*`;
  const apiPath = "/api/files/:path*";

  return [
    { source: filesPath, destination: `${origin}${filesPath}` },
    {
      source: `/:locale(${locales.join("|")})${filesPath}`,
      destination: `${origin}/:locale${filesPath}`,
    },
    { source: assetsPath, destination: `${origin}${assetsPath}` },
    { source: apiPath, destination: `${origin}${apiPath}` },
  ];
}

let nextConfig: NextConfig = {
  ...config,
  images: { ...config.images, qualities: [60, 75] },
  experimental: { ...config.experimental, optimizePackageImports: ["three"] },
  outputFileTracingIncludes: {
    "/*": ["./generated/lanyard/previews.json"],
    "/\\[locale\\]/resume/pdf": [
      // Typst loads the compiler binary from its package directory at runtime.
      "../../node_modules/.pnpm/@myriaddreamin+typst-ts-web-compiler@*/node_modules/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm",
    ],
    "/**/opengraph-image*": [
      "./node_modules/@fontsource/arimo/files/arimo-latin*-normal.woff",
      "./node_modules/@fontsource/noto-sans-jp/files/*-700-normal.woff",
      "./node_modules/@fontsource/noto-sans-sc/files/*-700-normal.woff",
    ],
  },
  outputFileTracingExcludes: {
    "/**/opengraph-image*": [
      "../../node_modules/**/files/noto-sans-*-{100,200,300,400,500,600,800,900}-normal.woff",
      "../../node_modules/**/files/arimo-*-{500,600}-normal.woff",
    ],
  },
  headers() {
    return [
      {
        source: "/assets/lanyard/generated/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  rewrites() {
    return env.VERCEL ? [] : [...localFilesRewrites(), ...studioRewrites];
  },
};

if (env.VERCEL) {
  nextConfig = withSentry(nextConfig);
}

if (env.ANALYZE === "true") {
  nextConfig = withAnalyzer(nextConfig);
}

export default withInternationalization(withCMS(nextConfig));
