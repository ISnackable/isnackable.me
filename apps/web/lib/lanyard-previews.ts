import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import type { LanyardDictionary } from "../app/(main)/[locale]/(home)/components/lanyard-content";
import {
  LANYARD_PREVIEW_VERSION,
  type LanyardPreviewManifest,
} from "../app/(main)/[locale]/(home)/components/lanyard-preview";
import { lanyardPreviewKey } from "./lanyard-preview-key";

export async function getLanyardPreview(
  dictionary: LanyardDictionary,
  portrait: string
) {
  "use cache";
  cacheLife("max");
  try {
    const manifest: LanyardPreviewManifest = JSON.parse(
      await readFile(
        path.join(process.cwd(), "generated/lanyard/previews.json"),
        "utf8"
      )
    );
    if (manifest.version !== LANYARD_PREVIEW_VERSION) {
      return;
    }
    const key = lanyardPreviewKey(dictionary, portrait);
    const preview = manifest.previews[key];
    return preview?.contentKey === key ? preview : undefined;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      // Development works without Chromium or generated assets. Production
      // generates these before building, including for revalidated homepages.
      return;
    }
    throw error;
  }
}
