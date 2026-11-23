import { formatFileSize } from "@repo/design-system/components/extend/file-format";
import { buttonVariants } from "@repo/design-system/components/ui/button";
import type { FilesMessages } from "@repo/internationalization/dictionaries";
import type { Locale } from "@repo/internationalization/locales";
import { DownloadIcon } from "lucide-react";
import type { ReactNode } from "react";
import { filesApiHref } from "@/lib/files/paths";
import { canPreview, previewType } from "@/lib/files/preview";
import type { FileDetails } from "@/lib/files/types";
import { FileDetailsFallback } from "./file-details";
import { ShareButton } from "./share-button";
import { FileTextPreview } from "./text-preview";
import { DocumentViewer, MediaViewer } from "./viewers";

interface FilePreviewProps {
  readonly file: FileDetails;
  readonly locale: Locale;
  readonly messages: FilesMessages;
}

function PreviewContent({
  fallback,
  file,
  locale,
  messages,
  type,
}: FilePreviewProps & {
  readonly fallback: ReactNode;
  readonly type: ReturnType<typeof previewType>;
}) {
  const { name, path } = file;
  const src = filesApiHref("content", path, { preview: "1" });
  if (type.kind === "document") {
    return (
      <DocumentViewer
        fallback={fallback}
        fileName={name}
        format={type.format}
        src={src}
      />
    );
  }
  if (type.kind === "image" || type.kind === "audio" || type.kind === "video") {
    return (
      <MediaViewer fallback={fallback} kind={type.kind} name={name} src={src} />
    );
  }
  if (
    type.kind === "text" ||
    type.kind === "markdown" ||
    type.kind === "link"
  ) {
    return (
      <FileTextPreview
        fallback={fallback}
        kind={type.kind}
        locale={locale}
        messages={messages}
        path={path}
      />
    );
  }
  return fallback;
}

export function FilePreview({ file, locale, messages }: FilePreviewProps) {
  const { name, path, size } = file;
  const download = filesApiHref("content", path);
  const type = previewType(name);
  const previewable = canPreview(type, size);
  const fallback = (
    <FileDetailsFallback file={file} locale={locale} messages={messages} />
  );
  return (
    <>
      <div className="flex min-h-8 flex-wrap items-center gap-3">
        {previewable && size !== undefined && (
          <p className="text-muted-foreground text-sm">
            {formatFileSize(size, locale)}
          </p>
        )}
        <div className="ms-auto flex flex-wrap items-center gap-2">
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
      {previewable ? (
        <PreviewContent
          fallback={fallback}
          file={file}
          key={path.join("/")}
          locale={locale}
          messages={messages}
          type={type}
        />
      ) : (
        fallback
      )}
    </>
  );
}
