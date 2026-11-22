"use client";

import type { FilesMessages } from "@repo/internationalization/dictionaries";
import type { Locale } from "@repo/internationalization/locales";
import { useEffect } from "react";
import { preload } from "react-dom";
import useSWRInfinite from "swr/infinite";
import { fetchFilesJson } from "@/lib/files/client";
import type { FilesError } from "@/lib/files/errors";
import { browseHref, filesApiHref } from "@/lib/files/paths";
import { canPreview, previewType } from "@/lib/files/preview";
import type { BrowsePage, FilesErrorCode } from "@/lib/files/types";
import { FilesDirectory } from "./directory";
import { FilePreview } from "./file-preview";
import { FileLocation } from "./location";
import { FilesLoading, FilesStatus } from "./status";
import { FolderReadme } from "./text-preview";

interface BrowseProps {
  readonly locale: Locale;
  readonly messages: FilesMessages;
  readonly path: readonly string[];
}

function BrowseError({
  code,
  locale,
  messages,
}: {
  readonly code?: FilesErrorCode;
  readonly locale: Locale;
  readonly messages: FilesMessages;
}) {
  if (code === "missing" || code === "invalid") {
    return (
      <FilesStatus
        description={messages.missingDescription}
        home={{ href: browseHref(locale), label: messages.home }}
        title={messages.missing}
      />
    );
  }
  if (code === "unconfigured") {
    return (
      <FilesStatus
        description={messages.unconfiguredDescription}
        title={messages.unconfigured}
        unavailable
      />
    );
  }
  return (
    <FilesStatus
      description={
        code === "rate-limited"
          ? messages.rateLimited
          : messages.unavailableDescription
      }
      title={messages.unavailable}
      unavailable
    />
  );
}

export function BrowseView({ locale, messages, path }: BrowseProps) {
  const firstPage = filesApiHref("browse", path);
  if (typeof window === "undefined") {
    // Let the HTML start the listing request before SWR mounts.
    preload(firstPage, { as: "fetch", crossOrigin: "anonymous" });
  }
  const { data, error, isValidating, mutate, setSize, size } = useSWRInfinite<
    BrowsePage,
    FilesError
  >(
    (index, previous) => {
      if (index === 0) {
        return firstPage;
      }
      return previous?.kind === "folder" && previous.nextCursor
        ? filesApiHref("browse", path, { cursor: previous.nextCursor })
        : null;
    },
    fetchFilesJson<BrowsePage>
  );

  useEffect(() => {
    if (error?.code === "invalid-cursor" && size > 1) {
      // The first page supplies a fresh continuation for the restarted list.
      void setSize(1).catch(() => undefined);
    }
  }, [error, setSize, size]);

  const code = error?.code;
  if (code === "unconfigured" || code === "missing" || code === "invalid") {
    return <BrowseError code={code} locale={locale} messages={messages} />;
  }
  const pages = data ?? [];
  const first = pages[0];
  const location = (
    <FileLocation
      locale={locale}
      messages={messages}
      path={first?.entry.path ?? path}
    />
  );
  if (!first) {
    return error ? (
      <BrowseError code={code} locale={locale} messages={messages} />
    ) : (
      <>
        {location}
        <FilesLoading label={messages.loading} />
      </>
    );
  }
  if (first.kind === "file") {
    return (
      <>
        {location}
        <FilePreview file={first.entry} locale={locale} messages={messages} />
      </>
    );
  }

  const folder = first.entry.path;
  const last = pages.at(-1);
  const entries = pages.flatMap((page) =>
    page.kind === "folder" ? page.entries : []
  );
  const hasMore = last?.kind === "folder" && last.nextCursor !== null;
  const readme = entries.find(
    (entry) =>
      entry.kind === "file" &&
      entry.name.toLowerCase() === "readme.md" &&
      canPreview(previewType(entry.name), entry.size)
  );
  const loadError = Boolean(error && size > pages.length);
  return (
    <>
      {location}
      <FilesDirectory
        entries={entries}
        folder={folder}
        hasMore={hasMore}
        loadError={loadError}
        locale={locale}
        messages={messages}
        onLoadMore={() => {
          void (loadError ? mutate() : setSize(size + 1)).catch(
            () => undefined
          );
        }}
        pending={isValidating && size > pages.length}
      />
      {readme && (
        <FolderReadme
          loadingLabel={messages.previewLoading}
          locale={locale}
          path={readme.path}
          title={messages.readme}
        />
      )}
    </>
  );
}
