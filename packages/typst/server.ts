import "server-only";

import {
  createTypstCompiler,
  FetchPackageRegistry,
  loadFonts,
  MemoryAccessModel,
  type TypstCompiler,
} from "@myriaddreamin/typst.ts";
import {
  withAccessModel,
  withPackageRegistry,
} from "@myriaddreamin/typst.ts/options.init";

import {
  CJK_FONTS,
  CORE_FONTS,
  needsCJKFont,
  PACKAGE_DEPENDENCIES,
  type PreviewPackageSpec,
  packageKey,
} from "./config";
import type { CompiledTypstDocument, TypstProject } from "./types";

type TypstCompileFormat = "vector" | "pdf";

const accessModel = new MemoryAccessModel();

class PrefetchedPackageRegistry extends FetchPackageRegistry {
  readonly #packages = new Map<string, Uint8Array>();

  async prefetch(files: Record<string, string>) {
    const packageSpecs = new Map<string, PreviewPackageSpec>();
    const packagePattern = /@preview\/([a-zA-Z0-9_-]+):([0-9A-Za-z_.+-]+)/g;

    const addSpec = (spec: PreviewPackageSpec) => {
      const key = packageKey(spec);
      if (packageSpecs.has(key)) {
        return;
      }

      packageSpecs.set(key, spec);
      PACKAGE_DEPENDENCIES[key]?.forEach(addSpec);
    };

    for (const content of Object.values(files)) {
      for (const match of content.matchAll(packagePattern)) {
        addSpec({ namespace: "preview", name: match[1], version: match[2] });
      }
    }

    await Promise.all(
      [...packageSpecs.values()].map(async (spec) => {
        const path = this.resolvePath(spec);
        if (this.#packages.has(path)) {
          return;
        }

        const response = await fetch(path);
        if (!response.ok) {
          throw new Error(
            `Failed to load Typst package ${spec.name}:${spec.version}`
          );
        }

        this.#packages.set(path, new Uint8Array(await response.arrayBuffer()));
      })
    );
  }

  pullPackageData(path: { namespace: string; name: string; version: string }) {
    return this.#packages.get(this.resolvePath(path));
  }
}

const packageRegistry = new PrefetchedPackageRegistry(accessModel);

let compilerPromise: Promise<TypstCompiler> | null = null;
let compileQueue: Promise<unknown> = Promise.resolve();
let cjkLoaded = false;

async function createCompiler(fonts: string[]) {
  const compiler = createTypstCompiler();
  await compiler.init({
    beforeBuild: [
      loadFonts(fonts, { assets: ["text"] }),
      withAccessModel(accessModel),
      withPackageRegistry(packageRegistry),
    ],
  });
  return compiler;
}

async function getCompiler(files: Record<string, string>) {
  await packageRegistry.prefetch(files);

  const content = Object.values(files).join("\n");
  if (needsCJKFont(content) && !cjkLoaded) {
    cjkLoaded = true;
    compilerPromise = createCompiler([...CORE_FONTS, ...CJK_FONTS]);
  }

  if (!compilerPromise) {
    compilerPromise = createCompiler(CORE_FONTS);
  }

  try {
    return await compilerPromise;
  } catch (error) {
    // A transient font/WASM failure must not poison every subsequent export.
    compilerPromise = null;
    cjkLoaded = false;
    throw error;
  }
}

async function fetchProjectAssets(assetUrls: Record<string, string>) {
  const entries = await Promise.all(
    Object.entries(assetUrls).map(async ([path, url]) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to load Typst asset ${path}: ${response.statusText}`
        );
      }

      return [path, new Uint8Array(await response.arrayBuffer())] as const;
    })
  );

  return Object.fromEntries(entries);
}

async function compileArtifact(
  compiler: TypstCompiler,
  mainFile: string,
  format: TypstCompileFormat
) {
  const result = await compiler.compile({
    mainFilePath: mainFile.startsWith("/") ? mainFile : `/${mainFile}`,
    format: format === "pdf" ? 1 : 0,
    diagnostics: "unix",
  });

  const diagnostics = (result.diagnostics ?? []).map(String);
  if (!result.result) {
    throw new Error(
      diagnostics.length ? diagnostics.join("\n") : "Typst compilation failed."
    );
  }

  return bytesToBase64(result.result);
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

async function compileProject(
  project: TypstProject
): Promise<CompiledTypstDocument> {
  const assetFiles = await fetchProjectAssets(project.assets);
  const compiler = await getCompiler(project.files);

  await compiler.reset();
  compiler.resetShadow();

  for (const [path, content] of Object.entries(project.files)) {
    compiler.addSource(path.startsWith("/") ? path : `/${path}`, content);
  }

  for (const [path, content] of Object.entries(assetFiles)) {
    compiler.mapShadow(path.startsWith("/") ? path : `/${path}`, content);
  }

  return {
    vectorArtifactBase64: await compileArtifact(
      compiler,
      project.mainFile,
      "vector"
    ),
    pdfArtifactBase64: await compileArtifact(compiler, project.mainFile, "pdf"),
    filename: project.filename,
  };
}

/**
 * Compiles a `TypstProject` to vector + PDF artifacts on the server.
 * A serial queue guards the shared in-memory compiler so concurrent
 * requests don't race.
 */
export function compileTypstProject(
  project: TypstProject
): Promise<CompiledTypstDocument> {
  const run = compileQueue
    .catch(() => undefined)
    .then(() => compileProject(project));
  compileQueue = run.catch(() => undefined);
  return run;
}
