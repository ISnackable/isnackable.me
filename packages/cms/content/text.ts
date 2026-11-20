import { stegaClean } from "@sanity/client/stega";

/** Keep preview metadata on visible text while treating whitespace as missing content. */
export function contentText(value: string | null | undefined): string {
  return value && stegaClean(value).trim() ? value : "";
}
