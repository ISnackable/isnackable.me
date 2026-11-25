import type { NextConfig } from "next";
import { sanity } from "next-sanity/live/cache-life";
import { keys } from "./keys";

/**
 * CMS-specific Next.js configuration: Live API cache lifetime and optimized
 * images from the Sanity CDN.
 */
export const withCMS = (config: NextConfig): NextConfig => {
  const { NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET } = keys();
  config.cacheLife = { ...config.cacheLife, default: sanity };
  config.images ??= {};
  config.images.remotePatterns ??= [];
  config.images.remotePatterns.push({
    protocol: "https",
    hostname: "cdn.sanity.io",
    port: "",
    pathname: `/images/${NEXT_PUBLIC_SANITY_PROJECT_ID}/${NEXT_PUBLIC_SANITY_DATASET}/**`,
  });

  return config;
};
