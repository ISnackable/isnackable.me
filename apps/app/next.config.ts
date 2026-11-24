import { siteConfig } from "@repo/config/site";
import { config, withAnalyzer } from "@repo/next-config";
import type { NextConfig } from "next";
import { env } from "@/env";
import { filesSecurityHeaders } from "./security-headers";

let nextConfig: NextConfig = {
  ...config,
  assetPrefix: siteConfig.files.assetPrefix,
  experimental: { ...config.experimental, globalNotFound: true },
  headers: filesSecurityHeaders,
};

if (env.ANALYZE === "true") {
  nextConfig = withAnalyzer(nextConfig);
}

export default nextConfig;
