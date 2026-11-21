import { withCMS } from "@repo/cms/next-config";
import { withInternationalization } from "@repo/internationalization/next-config";
import { config, withAnalyzer } from "@repo/next-config";
import { withLogging, withSentry } from "@repo/observability/next-config";
import type { NextConfig } from "next";
import { env } from "@/env";

let nextConfig: NextConfig = withLogging(config);

nextConfig.images = { ...nextConfig.images, qualities: [60, 75] };

nextConfig.experimental = {
  ...nextConfig.experimental,
  optimizePackageImports: ["three"],
};

nextConfig.outputFileTracingIncludes = {
  ...nextConfig.outputFileTracingIncludes,
  "/*": [
    ...(nextConfig.outputFileTracingIncludes?.["/*"] ?? []),
    "./generated/lanyard/previews.json",
  ],
  "/**/opengraph-image*": [
    "./node_modules/@fontsource/arimo/files/arimo-latin*-normal.woff",
    "./node_modules/@fontsource/noto-sans-jp/files/*-700-normal.woff",
    "./node_modules/@fontsource/noto-sans-sc/files/*-700-normal.woff",
  ],
};
nextConfig.outputFileTracingExcludes = {
  ...nextConfig.outputFileTracingExcludes,
  "/**/opengraph-image*": [
    "../../node_modules/**/files/noto-sans-*-{100,200,300,400,500,600,800,900}-normal.woff",
    "../../node_modules/**/files/arimo-*-{500,600}-normal.woff",
  ],
};
const existingHeaders = nextConfig.headers;
nextConfig.headers = async () => [
  ...((await existingHeaders?.()) ?? []),
  {
    source: "/assets/lanyard/generated/:path*",
    headers: [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ],
  },
];

if (process.env.NODE_ENV === "production") {
  const webUrl = env.NEXT_PUBLIC_WEB_URL
    ? new URL(env.NEXT_PUBLIC_WEB_URL)
    : undefined;
  const filesUrl = env.NEXT_PUBLIC_APP_URL
    ? new URL(env.NEXT_PUBLIC_APP_URL)
    : undefined;

  const redirects: NextConfig["redirects"] = async () => [
    ...(webUrl && filesUrl && webUrl.hostname !== filesUrl.hostname
      ? [
          {
            source: "/files/:path*",
            destination: `${filesUrl.origin}/:path*`,
            permanent: false,
          },
        ]
      : []),
    {
      // Locale-aware: /:locale/legal → /:locale/legal/privacy (single hop).
      source: "/:locale/legal",
      destination: "/:locale/legal/privacy",
      statusCode: 301,
    },
  ];

  nextConfig.redirects = redirects;
}

if (env.VERCEL) {
  nextConfig = withSentry(nextConfig);
} else {
  const existingRewrites = nextConfig.rewrites;
  nextConfig.rewrites = async () => {
    const rewrites = await existingRewrites?.();
    const studio = {
      source: "/studio/:path*",
      destination: "http://127.0.0.1:3333/studio/:path*",
    };

    return Array.isArray(rewrites)
      ? [studio, ...rewrites]
      : { ...rewrites, afterFiles: [studio, ...(rewrites?.afterFiles ?? [])] };
  };
}

if (env.ANALYZE === "true") {
  nextConfig = withAnalyzer(nextConfig);
}

export default withInternationalization(withCMS(nextConfig));
