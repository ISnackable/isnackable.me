import { copyFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(
  new URL("../../../packages/design-system/package.json", import.meta.url)
);
const output = new URL("../public/files-static/viewers/", import.meta.url);

await mkdir(output, { recursive: true });
await copyFile(
  require.resolve("@embedpdf/pdfium/pdfium.wasm"),
  new URL("pdfium.wasm", output)
);
