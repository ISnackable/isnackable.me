import type { TypedObject } from "@portabletext/types";
import readingTime from "reading-time";
import { toPlainText } from "./plain-text";

/**
 * Estimate reading time for a Portable Text body.
 *
 * Return minutes as data; UI dictionaries own the localized reading-time label.
 */
export function getReadingTime(body?: TypedObject[]): number {
  const text = toPlainText(body);
  if (!text.trim()) {
    return 1;
  }

  const stats = readingTime(text);
  return Math.max(1, Math.round(stats.minutes));
}
