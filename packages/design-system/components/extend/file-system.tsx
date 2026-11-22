"use client";

import { LayoutGridIcon, ListIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { formatFileSize } from "./file-format";
import {
  FileSystemFolderGlyph,
  FileSystemIconSpriteSheet,
  FileTypeIcon,
} from "./file-system-icons";
import { FileThumbnail } from "./file-thumbnail";

const displayExtension = /\.([^.]{1,12})$/;

export interface FileSystemItem {
  readonly key: string;
  readonly kind: "file" | "folder";
  readonly name: string;
  readonly path: readonly string[];
  readonly previewImageUrl?: string;
  readonly size?: number;
  readonly updatedAt?: string;
}

export type FileSystemView = "icons" | "list";

interface FileSystemProps {
  readonly actions?: ReactNode;
  readonly items: readonly FileSystemItem[];
  readonly labels: {
    readonly grid: string;
    readonly list: string;
    readonly modified: string;
    readonly name: string;
    readonly itemActions?: string;
    readonly size: string;
    readonly view: string;
  };
  readonly locale: string;
  readonly onViewChange: (view: FileSystemView) => void;
  readonly renderItemActions?: (item: FileSystemItem) => ReactNode;
  readonly renderLink: (
    item: FileSystemItem,
    children: ReactNode,
    className: string
  ) => ReactNode;
  readonly selection?: {
    readonly all: ReactNode;
    readonly item: (item: FileSystemItem) => ReactNode;
  };
  readonly view: FileSystemView;
}

function TileVisual({ item }: { readonly item: FileSystemItem }) {
  if (item.kind === "folder") {
    return <FileSystemFolderGlyph className="h-13 w-auto drop-shadow-sm" />;
  }
  const extension = displayExtension.exec(item.name)?.[1];
  return (
    <FileThumbnail
      className="w-12 rounded-sm shadow-xs"
      fallbackContent={
        <span className="flex size-full flex-col items-center justify-center gap-1 bg-card text-muted-foreground">
          <FileTypeIcon className="size-4" fileName={item.name} />
          {extension && (
            <span className="max-w-full truncate px-0.5 font-semibold text-[0.5rem] uppercase">
              {extension}
            </span>
          )}
        </span>
      }
      previewAspectRatio={0.78}
      previewImageUrl={item.previewImageUrl}
    />
  );
}

/**
 * Extend File System adapted for paginated directories whose navigation is
 * owned by the caller. The icon grid keeps the upstream folder glyph and tiles.
 */
export function FileSystem({
  actions,
  items,
  labels,
  locale,
  onViewChange,
  renderItemActions,
  renderLink,
  selection,
  view,
}: FileSystemProps) {
  const date = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "UTC",
  });

  return (
    <div
      className="overflow-hidden rounded-xl border bg-card"
      data-slot="file-system"
    >
      <FileSystemIconSpriteSheet />
      <div className="flex min-h-12 items-center justify-between gap-3 border-b px-3 py-2 sm:px-4">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {selection && view === "icons" && selection.all}
          {actions}
        </div>
        <ToggleGroup
          aria-label={labels.view}
          onValueChange={([next]) => {
            if (next === "icons" || next === "list") {
              onViewChange(next);
            }
          }}
          size="sm"
          value={[view]}
          variant="outline"
        >
          <ToggleGroupItem
            aria-label={labels.list}
            title={labels.list}
            value="list"
          >
            <ListIcon aria-hidden />
          </ToggleGroupItem>
          <ToggleGroupItem
            aria-label={labels.grid}
            title={labels.grid}
            value="icons"
          >
            <LayoutGridIcon aria-hidden />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      {items.length > 0 &&
        (view === "icons" ? (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-x-1 gap-y-3 p-3">
            {items.map((item) => (
              <li className="relative" key={item.key}>
                {renderLink(
                  item,
                  <>
                    <span className="flex h-16 w-20 shrink-0 items-center justify-center rounded-lg p-1 group-hover:bg-accent group-focus-visible:ring-2 group-focus-visible:ring-ring">
                      <TileVisual item={item} />
                    </span>
                    <span className="flex w-full items-start justify-center gap-1 px-1.5 text-center text-xs leading-tight">
                      <span className="line-clamp-2 break-all">
                        {item.name}
                      </span>
                    </span>
                  </>,
                  "group flex h-[6.375rem] flex-col items-center gap-1.5 rounded-lg outline-none"
                )}
                {renderItemActions && (
                  <div className="mt-1 flex justify-center">
                    {renderItemActions(item)}
                  </div>
                )}
                {selection && (
                  <div className="absolute start-2 top-2">
                    {selection.item(item)}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/35 hover:bg-muted/35">
                {selection && (
                  <TableHead className="w-10 ps-4">{selection.all}</TableHead>
                )}
                <TableHead className="px-4 text-muted-foreground">
                  {labels.name}
                </TableHead>
                <TableHead className="hidden w-40 text-muted-foreground sm:table-cell">
                  {labels.modified}
                </TableHead>
                <TableHead className="w-24 pr-4 text-right text-muted-foreground">
                  {labels.size}
                </TableHead>
                {renderItemActions && (
                  <TableHead aria-label={labels.itemActions} className="w-20" />
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.key}>
                  {selection && (
                    <TableCell className="ps-4">
                      {selection.item(item)}
                    </TableCell>
                  )}
                  <TableCell className="max-w-0 p-0">
                    {renderLink(
                      item,
                      <>
                        {item.kind === "folder" ? (
                          <FileSystemFolderGlyph className="w-5 shrink-0" />
                        ) : (
                          <FileTypeIcon
                            className="size-5"
                            fileName={item.name}
                          />
                        )}
                        <span className="truncate">{item.name}</span>
                      </>,
                      "flex min-h-11 items-center gap-3 px-4 py-2 font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                    )}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground text-xs sm:table-cell">
                    {item.updatedAt &&
                    Number.isFinite(Date.parse(item.updatedAt))
                      ? date.format(new Date(item.updatedAt))
                      : "–"}
                  </TableCell>
                  <TableCell className="pr-4 text-right text-muted-foreground text-xs tabular-nums">
                    {item.size === undefined
                      ? "–"
                      : formatFileSize(item.size, locale)}
                  </TableCell>
                  {renderItemActions && (
                    <TableCell className="pr-3">
                      {renderItemActions(item)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ))}
    </div>
  );
}
