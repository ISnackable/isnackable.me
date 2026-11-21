const webOrigin = process.env.NEXT_PUBLIC_WEB_URL;
const filesOrigin = process.env.NEXT_PUBLIC_APP_URL;
const webUrl = webOrigin ? new URL(webOrigin) : undefined;
const filesUrl = filesOrigin ? new URL(filesOrigin) : undefined;
const hasFilesHost =
  webUrl && filesUrl && webUrl.hostname !== filesUrl.hostname;

export const config = {
  services: {
    web: {
      root: "apps/web",
      framework: "nextjs",
      buildCommand: "pnpm --dir ../.. run build --filter=web",
      ignoreCommand: "node scripts/skip-ci.js",
    },
    files: {
      root: "apps/app",
      framework: "nextjs",
      ignoreCommand: "node scripts/skip-ci.js",
    },
  },
  redirects: hasFilesHost
    ? [
        {
          source: "/files/:path*",
          has: [{ type: "host", value: { eq: webUrl.hostname } }],
          destination: `${filesUrl.origin}/:path*`,
          permanent: false,
        },
      ]
    : [],
  rewrites: [
    ...(hasFilesHost
      ? [
          {
            source: "/(.*)",
            has: [{ type: "host", value: { eq: filesUrl.hostname } }],
            destination: { service: "files" },
          },
        ]
      : []),
    { source: "/(.*)", destination: { service: "web" } },
  ],
};
