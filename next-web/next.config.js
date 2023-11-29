/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

const runtimeCaching = require("next-pwa/cache");
const withPWA = require("next-pwa")({
  dest: "public",
  runtimeCaching,
  buildExcludes: [/middleware-manifest.json$/],
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development"
});
const { withPlausibleProxy } = require("next-plausible");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});

const headers = async () => {
  return [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-DNS-Prefetch-Control",
          value: "on"
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff"
        },
        {
          key: "X-XSS-Protection",
          value: "1; mode=block"
        }
      ]
    }
  ];
};

/** @type {import('next').NextConfig} */
const nextConfig = withPlausibleProxy()(
  withBundleAnalyzer(
    withPWA({
      i18n: {
        locales: ["en"],
        defaultLocale: "en"
      },
      reactStrictMode: true,
      async rewrites() {
        return [
          {
            source: "/sitemap.xml",
            destination: "/api/sitemap"
          },
          {
            source: "/feed",
            destination: "/api/feed"
          }
        ];
      },
      headers,
      images: {
        domains: ["cdn.sanity.io", "res.cloudinary.com"]
      }
    })
  )
);

module.exports = nextConfig;
