"use client";

import type { TocItem } from "../content/rich-text/headings";

interface TocProps {
  items: TocItem[];
  label: string;
}

/**
 * Render a table of contents as anchor links to heading IDs.
 *
 * The companion `getTableOfContents()` util produces the `items` shape from
 * a Portable Text body. The PortableText renderer shares the same rich-text
 * heading rules so links and IDs match.
 */
export function Toc({ items, label }: TocProps) {
  if (!items.length) {
    return null;
  }

  return (
    <nav aria-label={label} className="flex flex-col gap-1">
      {items.map((item) => (
        <a
          className="rounded-sm py-1 text-muted-foreground text-sm leading-6 underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          href={`#${item.url}`}
          key={item.url}
          style={{ paddingLeft: `${(item.depth - 1) * 12}px` }}
        >
          {item.title}
        </a>
      ))}
    </nav>
  );
}
