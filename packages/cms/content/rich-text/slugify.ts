/**
 * Slugify a string for use as a DOM element ID (heading anchors).
 *
 * Matches GitHub-style anchor generation closely enough for the TOC:
 * lowercase, spaces → hyphens, retain letters and numbers in every language.
 */
export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
