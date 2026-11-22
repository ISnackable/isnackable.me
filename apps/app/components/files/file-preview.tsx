import { formatFileSize } from "@repo/design-system/components/extend/file-format";
import { buttonVariants } from "@repo/design-system/components/ui/button";
import type { FilesMessages } from "@repo/internationalization/dictionaries";
import type { Locale } from "@repo/internationalization/locales";
import { DownloadIcon } from "lucide-react";
import { browseHref, filesApiHref } from "@/lib/files/paths";
import { canPreview, previewType } from "@/lib/files/preview";
import type { FileMetadata } from "@/lib/files/types";
import { FileLocation } from "./location";
import { ShareButton } from "./share-button";
import { PreviewUnavailable } from "./status";
import { FileTextPreview } from "./text-preview";
import { DocumentViewer, MediaViewer } from "./viewers";

interface FilePreviewProps {
  readonly file: FileMetadata;
  readonly locale: Locale;
  readonly messages: FilesMessages;
}

function PreviewContent({ file, locale, messages }: FilePreviewProps) {
  const { name, path, size } = file;
  const type = previewType(name);
  const src = filesApiHref("content", path, { preview: "1" });
  if (!canPreview(type, size)) {
    return <PreviewUnavailable messages={messages} />;
  }
  if (type.kind === "document") {
    return (
      <DocumentViewer
        fileName={name}
        format={type.format}
        messages={messages}
        src={src}
      />
    );
  }
  if (type.kind === "image" || type.kind === "audio" || type.kind === "video") {
    return (
      <MediaViewer kind={type.kind} messages={messages} name={name} src={src} />
    );
  }
  if (
    type.kind === "text" ||
    type.kind === "markdown" ||
    type.kind === "link"
  ) {
    return (
      <FileTextPreview
        kind={type.kind}
        locale={locale}
        messages={messages}
        path={path}
      />
    );
  }
  return <PreviewUnavailable messages={messages} />;
}

export function FilePreview({ file, locale, messages }: FilePreviewProps) {
  const { name, path, size } = file;
  const download = filesApiHref("content", path);
  return (
    <>
      <FileLocation locale={locale} messages={messages} path={path} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="break-all font-semibold text-2xl tracking-tight sm:text-3xl">
            {name}
          </h1>
          {size !== undefined && (
            <p className="text-muted-foreground text-sm">
              {formatFileSize(size, locale)}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ShareButton href={browseHref(locale, path)} messages={messages} />
          <ShareButton
            href={download}
            label={messages.copyDirect}
            messages={messages}
          />
          <a className={buttonVariants({ size: "sm" })} href={download}>
            <DownloadIcon aria-hidden data-icon="inline-start" />
            {messages.download}
          </a>
        </div>
      </div>
      <PreviewContent
        file={file}
        key={path.join("/")}
        locale={locale}
        messages={messages}
      />
    </>
  );
}
