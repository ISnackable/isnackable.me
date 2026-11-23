import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

export const config: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // The navigation test API is included only in dedicated local/CI test builds.
    exposeTestingApiInProductionBuild: process.env.EXPOSE_TESTING_API === "1",
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },

  // Preserve trailing slashes for service routes and PostHog requests.
  skipTrailingSlashRedirect: true,
};

export const withAnalyzer = (sourceConfig: NextConfig): NextConfig =>
  withBundleAnalyzer()(sourceConfig);
