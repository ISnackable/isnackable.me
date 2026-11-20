/**
 * Generic Typst project + compiled artifact shapes.
 *
 * `@repo/typst` is resume-agnostic: a `TypstProject` is just a set of text
 * files, remote asset URLs, an entrypoint, and a download filename. The
 * resume-specific generator lives in `apps/web`.
 */
export interface TypstProject {
  /** Remote asset URLs (images, `.bib`) fetched at compile time, keyed by path. */
  assets: Record<string, string>;
  /** Suggested download filename for PDF output. */
  filename: string;
  /** Generated `.typ` / `.toml` source files keyed by path. */
  files: Record<string, string>;
  /** Entrypoint path (e.g. `cv.typ`). */
  mainFile: string;
}

export interface CompiledTypstDocument {
  filename: string;
  /** Base64-encoded PDF artifact — for download. */
  pdfArtifactBase64: string;
  /** Base64-encoded vector artifact — for in-browser preview. */
  vectorArtifactBase64: string;
}
