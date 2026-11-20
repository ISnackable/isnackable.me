import { createRequire } from "node:module";
import path from "node:path";
import { defineConfig } from "vitest/config";

const require = createRequire(import.meta.url);
const resolvePackageDependency = (dependency: string, packageName: string) =>
  require.resolve(dependency, {
    paths: [path.resolve(import.meta.dirname, `../../packages/${packageName}`)],
  });

export default defineConfig({
  oxc: {
    jsx: { runtime: "automatic" },
  },
  test: {
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
    server: {
      deps: { inline: ["next-intl", "@zanreal/nemo"] },
    },
  },
  resolve: {
    alias: {
      "posthog-js": resolvePackageDependency("posthog-js", "analytics"),
      "@myriaddreamin/typst.ts/options.init": resolvePackageDependency(
        "@myriaddreamin/typst.ts/options.init",
        "typst"
      ),
      "@myriaddreamin/typst.ts": resolvePackageDependency(
        "@myriaddreamin/typst.ts",
        "typst"
      ),
      "server-only": path.resolve(
        import.meta.dirname,
        "__tests__/fixtures/server-only.ts"
      ),
      "@": path.resolve(import.meta.dirname, "./"),
      "@repo": path.resolve(import.meta.dirname, "../../packages"),
    },
  },
});
