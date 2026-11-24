"use client";

import { buttonVariants } from "@repo/design-system/components/ui/button";
import { Skeleton } from "@repo/design-system/components/ui/skeleton";
import type { FilesMessages } from "@repo/internationalization/dictionaries";
import type { Locale } from "@repo/internationalization/locales";
import { ArrowUpRightIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { type ReactNode, Suspense } from "react";
import useSWR from "swr";
import { filesApiHref } from "@/lib/files/paths";
import { shortcutUrl } from "@/lib/files/preview";

const FileMarkdown = dynamic(
  () => import("./markdown").then((module) => module.FileMarkdown),
  { ssr: false }
);
const textPreviewSurface =
  "min-h-32 rounded-xl border bg-card p-4 text-card-foreground sm:p-6";

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

function TextPreviewLoading({ label }: { readonly label: string }) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      className="grid gap-3"
      role="status"
    >
      <Skeleton className="h-5 w-40 max-w-full motion-reduce:animate-none" />
      <Skeleton className="h-4 w-full motion-reduce:animate-none" />
      <Skeleton className="h-4 w-2/3 motion-reduce:animate-none" />
    </div>
  );
}

function MarkdownPreview({
  body,
  loadingLabel,
  locale,
  path,
  title,
}: {
  readonly body: string | undefined;
  readonly loadingLabel: string;
  readonly locale: Locale;
  readonly path: readonly string[];
  readonly title?: string;
}) {
  const loading = <TextPreviewLoading label={loadingLabel} />;
  return (
    <section aria-label={title} className={textPreviewSurface}>
      <Suspense fallback={loading}>
        {body === undefined ? (
          loading
        ) : (
          <FileMarkdown
            body={body}
            folder={path.slice(0, -1)}
            locale={locale}
          />
        )}
      </Suspense>
    </section>
  );
}

export function FileTextPreview({
  fallback,
  kind,
  locale,
  messages,
  path,
}: {
  readonly fallback: ReactNode;
  readonly kind: "link" | "markdown" | "text";
  readonly locale: Locale;
  readonly messages: FilesMessages;
  readonly path: readonly string[];
}) {
  const { data, error } = useFileText(path);
  if (data === undefined && !error) {
    return (
      <div className={textPreviewSurface}>
        <TextPreviewLoading label={messages.previewLoading} />
      </div>
    );
  }
  if (data === null || data === undefined) {
    return fallback;
  }
  const url = kind === "link" ? shortcutUrl(data) : null;
  if (url) {
    return (
      <section
        className={`${textPreviewSurface} flex flex-wrap content-start items-center gap-3`}
      >
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
    <MarkdownPreview
      body={data}
      loadingLabel={messages.previewLoading}
      locale={locale}
      path={path}
    />
  ) : (
    <pre
      className={`${textPreviewSurface} max-h-[75svh] overflow-auto text-sm`}
    >
      <code>{data}</code>
    </pre>
  );
}

export function FolderReadme({
  loadingLabel,
  locale,
  path,
  title,
}: {
  readonly loadingLabel: string;
  readonly locale: Locale;
  readonly path: readonly string[];
  readonly title: string;
}) {
  const { data, isLoading } = useFileText(path);
  if (!(data || isLoading)) {
    return null;
  }
  return (
    <MarkdownPreview
      body={data ?? undefined}
      loadingLabel={loadingLabel}
      locale={locale}
      path={path}
      title={title}
    />
  );
}
