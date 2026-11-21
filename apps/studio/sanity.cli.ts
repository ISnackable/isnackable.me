import { defineCliConfig } from "sanity/cli";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const basePath = "/studio";
// The Sanity document starts with root-relative icon and manifest links.
const prefixStudioIconPaths = (html: string) =>
  html.replaceAll('href="/static/', `href="${basePath}/static/`);

export default defineCliConfig({
  api: { projectId, dataset },
  project: { basePath },
  server: { hostname: "127.0.0.1" },
  vite: {
    define: {
      "process.env.NEXT_PUBLIC_SANITY_PROJECT_ID": JSON.stringify(
        projectId ?? ""
      ),
      "process.env.NEXT_PUBLIC_SANITY_DATASET": JSON.stringify(dataset ?? ""),
    },
    plugins: [
      {
        name: "studio-icon-paths",
        transformIndexHtml: {
          order: "post",
          handler: prefixStudioIconPaths,
        },
        generateBundle: {
          order: "post",
          handler(_options, bundle) {
            const document = bundle["index.html"];
            if (
              document?.type === "asset" &&
              typeof document.source === "string"
            ) {
              document.source = prefixStudioIconPaths(document.source);
            }
          },
        },
      },
    ],
  },
});
