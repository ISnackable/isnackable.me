"use client";

import {
  FileSystem,
  type FileSystemItem,
} from "@repo/design-system/components/extend/file-system";
import {
  Button,
  buttonVariants,
} from "@repo/design-system/components/ui/button";
import { Checkbox } from "@repo/design-system/components/ui/checkbox";
import type { FilesMessages } from "@repo/internationalization/dictionaries";
import type { Locale } from "@repo/internationalization/locales";
import { DownloadIcon } from "lucide-react";
import { useRef, useState } from "react";
import { archiveSelectionLimit } from "@/lib/files/limits";
import { browseHref, filesApiHref } from "@/lib/files/paths";
import { previewType } from "@/lib/files/preview";
import type { FileEntry } from "@/lib/files/types";
import { BrowseLink } from "./browse-link";
import { DirectoryActions } from "./directory-actions";
import { ShareButton } from "./share-button";
import { FilesStatus } from "./status";
import { useDirectoryView } from "./use-directory-view";

interface DirectoryProps {
  readonly entries: readonly FileEntry[];
  readonly folder: readonly string[];
  readonly hasMore: boolean;
  readonly loadError: boolean;
  readonly locale: Locale;
  readonly messages: FilesMessages;
  readonly onLoadMore: () => void;
  readonly pending: boolean;
}

function DirectoryItemActions({
  item,
  locale,
  messages,
}: Pick<DirectoryProps, "locale" | "messages"> & {
  readonly item: FileSystemItem;
}) {
  const href =
    item.kind === "file"
      ? filesApiHref("content", item.path)
      : browseHref(locale, item.path);
  const download = messages.downloadItem.replace("{name}", item.name);
  return (
    <div className="flex gap-0.5">
      <ShareButton
        compact
        href={href}
        label={messages.copyItem.replace("{name}", item.name)}
        messages={messages}
      />
      {item.kind === "file" ? (
        <a
          aria-label={download}
          className={buttonVariants({ size: "icon-sm", variant: "ghost" })}
          href={href}
          title={download}
        >
          <DownloadIcon aria-hidden />
        </a>
      ) : (
        <form action="/api/files/archive" method="post">
          <input name="path" type="hidden" value={item.path.join("/")} />
          <Button
            aria-label={download}
            size="icon-sm"
            title={download}
            type="submit"
            variant="ghost"
          >
            <DownloadIcon aria-hidden />
          </Button>
        </form>
      )}
    </div>
  );
}

function directoryItems(items: readonly FileEntry[]): FileSystemItem[] {
  const entries = new Map(
    items.map((entry) => [entry.path.join("/"), entry] as const)
  );
  return Array.from(entries, ([key, entry]) => {
    const kind = previewType(entry.name).kind;
    return {
      ...entry,
      key,
      previewImageUrl:
        entry.kind === "file" &&
        (kind === "image" || kind === "document" || kind === "video")
          ? filesApiHref("thumbnail", entry.path)
          : undefined,
      updatedAt: entry.modifiedAt,
    };
  });
}

export function FilesDirectory({
  entries,
  folder,
  hasMore,
  loadError,
  locale,
  messages,
  onLoadMore,
  pending,
}: DirectoryProps) {
  const [view, setView] = useDirectoryView();
  const [selectedKeys, setSelectedKeys] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  const selectAll = useRef<HTMLElement>(null);
  const items = directoryItems(entries);
  const selectedItems = items.filter((item) => selectedKeys.has(item.key));
  const selectedCount = selectedItems.length;
  const allSelected = selectedCount === items.length;

  function selectItem(key: string, checked: boolean) {
    setSelectedKeys((before) => {
      const next = new Set(before);
      if (checked) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedKeys(new Set());
    selectAll.current?.focus();
  }

  return (
    <div className="flex flex-col gap-3">
      <FileSystem
        actions={
          <DirectoryActions
            folder={folder}
            locale={locale}
            messages={messages}
            onClearSelection={clearSelection}
            selectedItems={selectedItems}
          />
        }
        items={items}
        labels={messages}
        locale={locale}
        onViewChange={setView}
        renderItemActions={(item) => (
          <DirectoryItemActions
            item={item}
            locale={locale}
            messages={messages}
          />
        )}
        renderLink={(item, children, className) => (
          <BrowseLink
            className={className}
            locale={locale}
            path={item.path}
            title={item.name}
          >
            {children}
          </BrowseLink>
        )}
        selection={
          items.length > 0
            ? {
                all: (
                  <Checkbox
                    aria-label={messages.selectAll}
                    checked={allSelected}
                    indeterminate={!allSelected && selectedCount > 0}
                    onCheckedChange={(checked) =>
                      setSelectedKeys(
                        new Set(checked ? items.map((item) => item.key) : [])
                      )
                    }
                    ref={selectAll}
                    title={messages.selectAll}
                  />
                ),
                item: (item) => (
                  <Checkbox
                    aria-label={messages.selectItem.replace(
                      "{name}",
                      () => item.name
                    )}
                    checked={selectedKeys.has(item.key)}
                    onCheckedChange={(checked) => selectItem(item.key, checked)}
                  />
                ),
                selectedKeys,
              }
            : undefined
        }
        view={view}
      />
      {items.length === 0 && !hasMore && <FilesStatus title={messages.empty} />}
      {selectedCount > archiveSelectionLimit && (
        <p className="text-destructive text-sm" role="alert">
          {messages.selectionLimit.replace(
            "{limit}",
            String(archiveSelectionLimit)
          )}
        </p>
      )}
      {hasMore && (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            disabled={pending}
            onClick={onLoadMore}
            size="sm"
            variant="outline"
          >
            {pending ? messages.loading : messages.loadMore}
          </Button>
          {loadError && (
            <p className="text-destructive text-sm" role="alert">
              {messages.moreError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
