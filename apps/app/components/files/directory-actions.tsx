"use client";

import type { FileSystemItem } from "@repo/design-system/components/extend/file-system";
import {
  Button,
  buttonVariants,
} from "@repo/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import type { FilesMessages } from "@repo/internationalization/dictionaries";
import type { Locale } from "@repo/internationalization/locales";
import { DownloadIcon, EllipsisIcon, LinkIcon, XIcon } from "lucide-react";
import { useId, useMemo, useRef } from "react";
import { copyFileLinks } from "@/lib/files/copy-links";
import { archiveEntryLimit, archiveSelectionLimit } from "@/lib/files/limits";
import { browseHref, filesApiHref } from "@/lib/files/paths";

interface DirectoryActionsProps {
  readonly folder: readonly string[];
  readonly locale: Locale;
  readonly messages: FilesMessages;
  readonly onClearSelection: () => void;
  readonly selectedItems: readonly FileSystemItem[];
}

function FolderActions({
  folder,
  locale,
  messages,
}: Pick<DirectoryActionsProps, "folder" | "locale" | "messages">) {
  const archiveForm = useRef<HTMLFormElement>(null);
  const archiveLimitDescription = useId();
  const numberFormat = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  return (
    <>
      <form action="/api/files/archive" hidden method="post" ref={archiveForm}>
        <input name="path" type="hidden" value={folder.join("/")} />
      </form>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={messages.folderActions}
              size="icon-sm"
              title={messages.folderActions}
              variant="ghost"
            />
          }
        >
          <EllipsisIcon aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-max max-w-64">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() =>
                copyFileLinks(browseHref(locale, folder), messages)
              }
            >
              <LinkIcon aria-hidden />
              {messages.copy}
            </DropdownMenuItem>
            <DropdownMenuItem
              aria-describedby={archiveLimitDescription}
              aria-label={messages.downloadFolder}
              className="items-start"
              onClick={() => archiveForm.current?.requestSubmit()}
            >
              <DownloadIcon aria-hidden className="mt-0.5" />
              <span className="flex max-w-52 flex-col gap-0.5">
                {messages.downloadFolder}
                <span
                  className="text-muted-foreground text-xs"
                  id={archiveLimitDescription}
                >
                  {messages.archiveEntryLimit.replace(
                    "{limit}",
                    numberFormat.format(archiveEntryLimit)
                  )}
                </span>
              </span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

function SelectionActions({
  locale,
  messages,
  onClearSelection,
  selectedItems,
}: Omit<DirectoryActionsProps, "folder">) {
  const singleFile =
    selectedItems.length === 1 && selectedItems[0].kind === "file"
      ? selectedItems[0]
      : null;
  const selectedLinks = selectedItems.map((item) =>
    item.kind === "folder"
      ? browseHref(locale, item.path)
      : filesApiHref("content", item.path)
  );
  const copyLabel =
    selectedItems.length === 1 ? messages.copy : messages.copySelected;

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <Button
        aria-label={copyLabel}
        onClick={() => copyFileLinks(selectedLinks, messages)}
        size="icon-sm"
        title={copyLabel}
        type="button"
        variant="ghost"
      >
        <LinkIcon aria-hidden />
      </Button>
      {singleFile ? (
        <a
          aria-label={messages.downloadSelected}
          className={buttonVariants({ size: "icon-sm", variant: "ghost" })}
          href={filesApiHref("content", singleFile.path)}
          title={messages.downloadSelected}
        >
          <DownloadIcon aria-hidden />
        </a>
      ) : (
        <form action="/api/files/archive" method="post">
          {selectedItems.map((item) => (
            <input
              key={item.key}
              name="path"
              type="hidden"
              value={item.path.join("/")}
            />
          ))}
          <Button
            aria-label={messages.downloadSelected}
            disabled={selectedItems.length > archiveSelectionLimit}
            size="icon-sm"
            title={messages.downloadSelected}
            type="submit"
            variant="ghost"
          >
            <DownloadIcon aria-hidden />
          </Button>
        </form>
      )}
      <Button
        aria-label={messages.clearSelection}
        onClick={onClearSelection}
        size="icon-sm"
        title={messages.clearSelection}
        type="button"
        variant="ghost"
      >
        <XIcon aria-hidden />
      </Button>
    </div>
  );
}

export function DirectoryActions({
  folder,
  locale,
  messages,
  onClearSelection,
  selectedItems,
}: DirectoryActionsProps) {
  const selectedCount = selectedItems.length;
  const numberFormat = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className="truncate text-muted-foreground text-xs tabular-nums empty:sr-only sm:text-sm"
        role="status"
      >
        {selectedCount > 0 &&
          messages.selectedCount.replace(
            "{count}",
            numberFormat.format(selectedCount)
          )}
      </span>
      {selectedCount > 0 ? (
        <SelectionActions
          locale={locale}
          messages={messages}
          onClearSelection={onClearSelection}
          selectedItems={selectedItems}
        />
      ) : (
        <FolderActions folder={folder} locale={locale} messages={messages} />
      )}
    </div>
  );
}
