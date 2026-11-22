import type { PdfEngine } from "@embedpdf/models";

let engine: Promise<PdfEngine> | undefined;

export function getPdfSourceUrl(src: string) {
  // Raw base64 must start with the encoded PDF header to distinguish it from a path.
  if (/^\s*JVBERi0/.test(src) && !/[^A-Za-z0-9+/=\s]/.test(src)) {
    return `data:application/pdf;base64,${src.replace(/\s/g, "")}`;
  }
  return src;
}

export function loadSharedPdfEngine() {
  engine ??= import("@embedpdf/engines/pdfium-worker-engine")
    .then(({ createPdfiumEngine }) =>
      createPdfiumEngine(new URL("/assets/viewers/pdfium.wasm", window.location.origin).href, {})
    )
    .catch((error: unknown) => {
      engine = undefined;
      throw error;
    });
  return engine;
}
