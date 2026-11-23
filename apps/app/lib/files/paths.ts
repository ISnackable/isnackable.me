import { filesHref } from "@repo/config/url";
import type { Locale } from "@repo/internationalization/locales";
import { filePathLimit } from "./limits";

// Microsoft forbids these characters in OneDrive names. Percent and hash are valid.
// biome-ignore lint/suspicious/noControlCharactersInRegex: Reject URL and HTTP control characters.
const forbiddenNameCharacters = /[\u0000-\u001f\u007f\ud800-\udfff/\\:*?"<>|]/u;
const hiddenPassword = ".password";

function isFileName(value: string): boolean {
  return (
    value.length > 0 &&
    value.length <= 255 &&
    value !== "." &&
    value !== ".." &&
    value.toLowerCase() !== hiddenPassword &&
    !forbiddenNameCharacters.test(value)
  );
}

export function isFilePath(segments: readonly string[]): boolean {
  return (
    segments.join("/").length <= filePathLimit && segments.every(isFileName)
  );
}

export function readBrowsePath(segments: readonly string[]): string[] | null {
  try {
    // The App Router supplies URI-encoded dynamic segment values.
    const path = segments.map(decodeURIComponent);
    return isFilePath(path) ? path : null;
  } catch {
    return null;
  }
}

export function readFilePath(value: string | null): string[] | null {
  if (value === null) {
    return null;
  }

  const segments = value === "" ? [] : value.split("/");
  return isFilePath(segments) ? segments : null;
}

export function encodeFilePath(path: readonly string[]) {
  return path.map((segment) => encodeURIComponent(segment)).join("/");
}

export function browseHref(locale: Locale, path: readonly string[] = []) {
  const suffix = encodeFilePath(path);
  const root = filesHref(locale);
  return suffix ? `${root}/${suffix}` : root;
}

export function filesApiHref(
  endpoint: "browse" | "content" | "thumbnail",
  path: readonly string[],
  options?: Record<string, string>
) {
  const query = new URLSearchParams({ ...options, path: path.join("/") });
  return `/api/files/${endpoint}?${query}`;
}
