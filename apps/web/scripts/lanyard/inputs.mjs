import {
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import { build } from "tsup";

const WORKSPACE_PACKAGES = /^@repo\//;
const appRoot = fileURLToPath(new URL("../../", import.meta.url));
const directory = path.join(appRoot, "generated/lanyard");
export const snapshotPath = path.join(directory, "inputs.json");

export async function prepareInputs() {
  nextEnv.loadEnvConfig(appRoot, false);
  await mkdir(directory, { recursive: true });
  const staging = await mkdtemp(path.join(directory, ".inputs-"));
  try {
    await build({
      config: false,
      entry: {
        inputs: path.join(appRoot, "scripts/lanyard-preview-inputs.ts"),
      },
      platform: "node",
      format: ["cjs"],
      splitting: false,
      target: "node22",
      tsconfig: path.join(appRoot, "tsconfig.json"),
      outDir: staging,
      outExtension: () => ({ js: ".cjs" }),
      noExternal: [WORKSPACE_PACKAGES],
      silent: true,
    });
    const require = createRequire(import.meta.url);
    const { previewInputs, locales } = require(
      path.join(staging, "inputs.cjs")
    );
    const messages = Object.fromEntries(
      await Promise.all(
        locales.map(async (locale) => {
          const dictionary = JSON.parse(
            await readFile(
              path.join(
                appRoot,
                `../../packages/internationalization/messages/${locale}.json`
              ),
              "utf8"
            )
          );
          return [locale, dictionary.web.home.lanyard];
        })
      )
    );
    const configured = Boolean(
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
        process.env.NEXT_PUBLIC_SANITY_DATASET
    );
    const data = configured
      ? await previewInputs(messages)
      : { publishedRevision: "unconfigured", inputs: [] };
    // No timestamps or credentials: unchanged published content produces the
    // same bytes and therefore the same Turbo input hash on every build.
    const snapshot = {
      version: 1,
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "",
      ...data,
    };
    const output = path.join(staging, "inputs.json");
    await writeFile(output, JSON.stringify(snapshot));
    await rename(output, snapshotPath);
    console.info("Lanyard: prepared published CMS build inputs.");
    return snapshot;
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}

export async function readInputs() {
  const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
  if (
    snapshot.version !== 1 ||
    !Array.isArray(snapshot.inputs) ||
    typeof snapshot.publishedRevision !== "string"
  ) {
    throw new Error(
      "Invalid lanyard build inputs. Run pnpm --filter web lanyard:inputs before Turbo."
    );
  }
  return snapshot;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await prepareInputs();
}
