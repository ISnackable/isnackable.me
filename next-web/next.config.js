/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa");
const runtimeCaching = require("next-pwa/cache");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});

const headers = async () => {
  return [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-Content-Type-Options",
          value: "nosniff"
        },
        {
          key: "X-Frame-Options",
          value: "SAMEORIGIN"
        },
        {
          key: "X-XSS-Protection",
          value: "1; mode=block"
        }
      ]
    }
  ];
};

const nextConfig = withBundleAnalyzer(
  withPWA({
    reactStrictMode: true,
    webpack: (config, { isServer }) => {
      // Needed if your cache script is asynchronous
      config.experiments = {
        topLevelAwait: true
      };

      if (isServer) {
        return {
          ...config,
          // This is what allows us to add a node script via NextJS's server
          entry() {
            return config.entry().then((entry) => {
              return Object.assign({}, entry, {
                cache: "./scripts/cache.ts"
              });
            });
          }
        };
      }
      return config;
    },
    pwa: {
      dest: "public",
      runtimeCaching,
      buildExcludes: [/middleware-manifest.json$/],
      register: true,
      skipWaiting: true,
      disable: process.env.NODE_ENV === "development"
    },
    headers,
    images: {
      domains: ["cdn.sanity.io"]
    }
  })
);

module.exports = nextConfig;
