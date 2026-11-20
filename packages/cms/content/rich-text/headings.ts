import type { TypedObject } from "@portabletext/types";
import { stegaClean } from "@sanity/client/stega";
import { articleReservedIds, moduleAnchorId } from "../../modules/anchors";
import { isVisualModule } from "../../modules/types";
import { slugify } from "./slugify";
import type { RichTextNode } from "./types";

/** Compute once from the whole body so rendering and contents share collision rules. */
export function getHeadingAnchors(body: TypedObject[], prefix = "") {
  const used = new Set<string>([
    ...articleReservedIds,
    ...body.flatMap((block) =>
      isVisualModule(block)
        ? [moduleAnchorId(block._key, block.attributes)]
        : []
    ),
  ]);
  return body.flatMap((item) => {
    const block = item as RichTextNode;
    if (
      block._type !== "block" ||
      !Array.isArray(block.children) ||
      !["h2", "h3", "h4"].includes(String(block.style ?? ""))
    ) {
      return [];
    }
    const title = stegaClean(
      block.children
        .map((span) => (typeof span?.text === "string" ? span.text : ""))
        .join("")
    );
    const base = `${prefix}${slugify(title) || "heading"}`;
    let id = base;
    let suffix = 1;
    while (used.has(id)) {
      suffix += 1;
      id = `${base}-${suffix}`;
    }
    used.add(id);
    return [
      {
        key: block._key,
        title,
        id,
        depth: Number(String(block.style).slice(1)) - 1,
      },
    ];
  });
}

/**
 * A single entry in a table of contents.
 *
 * Shape is intentionally compatible with consumer-side TOC renderers
 * (fumadocs, etc.) — `depth` starts at 1 for `<h2>` (h1 is the page title).
 */
export interface TocItem {
  /** 1 = h2, 2 = h3, 3 = h4. */
  depth: number;
  /** Heading text. */
  title: string;
  /** Anchor target — the DOM id generated for the heading. */
  url: string;
}

/**
 * Build a table of contents from a Portable Text body by scanning for
 * heading blocks (h2/h3/h4). Nested by level so the renderer can show
 * hierarchy. Returns an empty array when there are no headings.
 */
export function getTableOfContents(body?: TypedObject[]): TocItem[] {
  if (!body?.length) {
    return [];
  }

  return getHeadingAnchors(body).map(({ title, id, depth }) => ({
    title,
    url: id,
    depth,
  }));
}
