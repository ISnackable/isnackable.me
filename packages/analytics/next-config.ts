import type { NextConfig } from "next";

interface Rewrite {
  destination: string;
  source: string;
}

type PostHogConfig = Omit<NextConfig, "rewrites"> & {
  rewrites?: () => Rewrite[];
};

const postHogRewrites = [
  {
    source: "/ingest/static/:path*",
    destination: "https://us-assets.i.posthog.com/static/:path*",
  },
  {
    source: "/ingest/:path*",
    destination: "https://us.i.posthog.com/:path*",
  },
];

export function withPostHog(config: PostHogConfig): NextConfig {
  return {
    ...config,
    rewrites: () => [...(config.rewrites?.() ?? []), ...postHogRewrites],
  };
}
