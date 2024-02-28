import { default as bundleAnalyzer } from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = withBundleAnalyzer({
  staticPageGenerationTimeout: 300,
  images: {
    remotePatterns: [
      { hostname: '*notion.so' },
      { hostname: 'images.unsplash.com' },
      { hostname: 'pbs.twimg.com' },
      { hostname: 'abs.twimg.com' },
      { hostname: 's3.us-west-2.amazonaws.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    serverComponentsExternalPackages: ['react-notion-x', 'notion-client'],
  },
  webpack: (config) => {
    config.externals.push(
      {
        sharp: 'commonjs sharp',
      },
      'canvas',
      'jsdom'
    );

    return config;
  },
});

export default nextConfig;
