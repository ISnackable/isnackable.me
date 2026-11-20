import { createHash } from "node:crypto";
import { access, cp, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

export function fingerprint(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

/** Only restore complete artifacts with their matching recipe/input key. */
export async function restoreCapture(directory, captureKey, output) {
  let manifest;
  try {
    manifest = JSON.parse(
      await readFile(path.join(directory, "previews.json"), "utf8")
    );
    if (manifest.captureKey !== captureKey) {
      return;
    }
    const urls = Object.values(manifest.previews).flatMap((preview) =>
      [preview.desktop, preview.mobile].flatMap((layout) =>
        [layout.light, layout.dark].flatMap((theme) =>
          [theme.entrance, theme.rest].flatMap((image) => [
            image.src,
            image.src2x,
          ])
        )
      )
    );
    if (
      !urls.every(
        (url) =>
          typeof url === "string" &&
          url.startsWith("/assets/lanyard/generated/")
      )
    ) {
      return;
    }
    await Promise.all(
      urls.map((url) =>
        access(path.join(directory, "assets", path.basename(url)))
      )
    );
    await mkdir(output, { recursive: true });
    await cp(path.join(directory, "assets"), output, { recursive: true });
    return manifest;
  } catch (error) {
    if (
      error.code === "ENOENT" ||
      error instanceof TypeError ||
      error instanceof SyntaxError
    ) {
      return;
    }
    throw error;
  }
}
