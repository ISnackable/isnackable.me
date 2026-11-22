"use client";

import { buttonVariants } from "@repo/design-system/components/ui/button";
import type { FilesMessages } from "@repo/internationalization/dictionaries";
import type { Locale } from "@repo/internationalization/locales";
import { ArrowUpRightIcon } from "lucide-react";
import dynamic from "next/dynamic";
import useSWR from "swr";
import { filesApiHref } from "@/lib/files/paths";
import { shortcutUrl } from "@/lib/files/preview";
import { FilesLoading, PreviewUnavailable } from "./status";

const FileMarkdown = dynamic(() =>
  import("./markdown").then((module) => module.FileMarkdown)
);

async function fetchText(url: string) {
  const response = await fetch(url);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Preview unavailable");
  }
  return await response.text();
}

function useFileText(path: readonly string[]) {
  return useSWR(filesApiHref("content", path, { preview: "1" }), fetchText);
}

export function FileTextPreview({
  kind,
  locale,
  messages,
  path,
}: {
  readonly kind: "link" | "markdown" | "text";
  readonly locale: Locale;
  readonly messages: FilesMessages;
  readonly path: readonly string[];
}) {
  const { data, error } = useFileText(path);
  if (data === undefined && !error) {
    return <FilesLoading label={messages.previewLoading} />;
  }
  if (data === null || data === undefined) {
    return <PreviewUnavailable messages={messages} />;
  }
  const url = kind === "link" ? shortcutUrl(data) : null;
  if (url) {
    return (
      <section className="flex flex-wrap items-center gap-3 rounded-xl border p-4">
        <span className="break-all text-muted-foreground text-sm">{url}</span>
        <a
          className={buttonVariants({ size: "sm", variant: "outline" })}
          href={url}
          rel="noreferrer"
          target="_blank"
        >
          {messages.openLink}
          <ArrowUpRightIcon aria-hidden data-icon="inline-end" />
        </a>
      </section>
    );
  }
  return kind === "markdown" ? (
    <section className="rounded-xl border p-4 sm:p-6">
      <FileMarkdown body={data} folder={path.slice(0, -1)} locale={locale} />
    </section>
  ) : (
    <pre className="max-h-[75svh] overflow-auto rounded-xl border bg-muted/30 p-4 text-sm sm:p-6">
      <code>{data}</code>
    </pre>
  );
}

export function FolderReadme({
  locale,
  path,
  title,
}: {
  readonly locale: Locale;
  readonly path: readonly string[];
  readonly title: string;
}) {
  const { data } = useFileText(path);
  return data ? (
    <section aria-label={title} className="rounded-xl border p-4 sm:p-6">
      <FileMarkdown body={data} folder={path.slice(0, -1)} locale={locale} />
    </section>
  ) : null;
}
