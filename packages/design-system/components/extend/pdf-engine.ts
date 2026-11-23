import type { PdfEngine } from "@embedpdf/models";

const engines = new Map<string, Promise<PdfEngine>>();

export function getPdfSourceUrl(src: string) {
  // Raw base64 must start with the encoded PDF header to distinguish it from a path.
  if (/^\s*JVBERi0/.test(src) && !/[^A-Za-z0-9+/=\s]/.test(src)) {
    return `data:application/pdf;base64,${src.replace(/\s/g, "")}`;
  }
  return src;
}

export function loadSharedPdfEngine(wasmSrc: string) {
  const url = new URL(wasmSrc, window.location.origin).href;
  const existing = engines.get(url);
  if (existing) {
    return existing;
  }
  const engine = import("@embedpdf/engines/pdfium-worker-engine")
    .then(({ createPdfiumEngine }) => createPdfiumEngine(url, {}))
    .catch((error: unknown) => {
      engines.delete(url);
      throw error;
    });
  engines.set(url, engine);
  return engine;
}
