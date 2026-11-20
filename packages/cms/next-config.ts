import type { NextConfig } from "next";
import { sanity } from "next-sanity/live/cache-life";

/**
 * CMS-specific Next.js configuration: Live API cache lifetime and optimized
 * images from the Sanity CDN.
 */
export const withCMS = (config: NextConfig): NextConfig => {
  config.cacheLife = { ...config.cacheLife, default: sanity };
  config.images ??= {};
  config.images.remotePatterns ??= [];
  config.images.remotePatterns.push({
    protocol: "https",
    hostname: "cdn.sanity.io",
  });

  return config;
};
