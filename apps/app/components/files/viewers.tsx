"use client";

import { useTheme } from "@repo/design-system/client";
import { Skeleton } from "@repo/design-system/components/ui/skeleton";
import dynamic from "next/dynamic";
import { Component, type ReactNode, useState } from "react";
import type { DocumentFormat } from "@/lib/files/preview";
import { type PreviewMessages, PreviewUnavailable } from "./status";

const PdfViewer = dynamic(
  () =>
    import("@repo/design-system/components/extend/pdf-viewer").then(
      (module) => module.PDFViewer
    ),
  { ssr: false }
);
const WordViewer = dynamic(
  () =>
    import("@repo/design-system/components/extend/docx-viewer").then(
      (module) => module.DocxViewerPreview
    ),
  { ssr: false }
);
const ExcelViewer = dynamic(
  () =>
    import("@repo/design-system/components/extend/xlsx-viewer").then(
      (module) => module.XlsxViewerPreview
    ),
  { ssr: false }
);
const PowerPointViewer = dynamic(
  () =>
    import("@repo/design-system/components/extend/pptx-viewer").then(
      (module) => module.PptxViewerPreview
    ),
  { ssr: false }
);

// biome-ignore lint/style/useReactFunctionComponents: React error boundaries require a class.
class ViewerBoundary extends Component<
  {
    readonly children: ReactNode;
    readonly messages: PreviewMessages;
  },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? (
      <PreviewUnavailable messages={this.props.messages} />
    ) : (
      this.props.children
    );
  }
}

export function DocumentViewer({
  fileName,
  format,
  messages,
  src,
}: {
  readonly fileName: string;
  readonly format: DocumentFormat;
  readonly messages: PreviewMessages;
  readonly src: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const theme = {
    isDark: resolvedTheme === "dark",
    onIsDarkChange: (isDark: boolean) => setTheme(isDark ? "dark" : "light"),
  };
  const document = { fileName, showDownload: false, showUpload: false, src };

  let viewer: ReactNode;
  switch (format) {
    case "docx":
      viewer = <WordViewer {...document} {...theme} />;
      break;
    case "pptx":
      viewer = (
        <PowerPointViewer defaultThumbnailSidebarOpen={false} {...document} />
      );
      break;
    case "xlsx":
      viewer = <ExcelViewer className="h-full" {...document} {...theme} />;
      break;
    default:
      viewer = <PdfViewer defaultZoom="fit-width" {...document} />;
  }

  return (
    <ViewerBoundary messages={messages}>
      <section
        aria-label={fileName}
        className="relative h-[min(75svh,56rem)] min-h-80 overflow-hidden rounded-xl border bg-muted/30"
      >
        <Skeleton aria-hidden className="absolute inset-0 -z-10 rounded-none" />
        {viewer}
      </section>
    </ViewerBoundary>
  );
}

export function MediaViewer({
  name,
  kind,
  messages,
  src,
}: {
  readonly name: string;
  readonly kind: "audio" | "image" | "video";
  readonly messages: PreviewMessages;
  readonly src: string;
}) {
  const [failed, setFailed] = useState(false);
  const onError = () => setFailed(true);
  if (failed) {
    return <PreviewUnavailable messages={messages} />;
  }
  if (kind === "image") {
    return (
      <div className="flex justify-center rounded-xl border bg-muted/40 p-3 sm:p-6">
        {/* biome-ignore lint/performance/noImgElement lint/correctness/useImageSize lint/a11y/noNoninteractiveElementInteractions: Dimensions are unavailable and onError provides a fallback for the authenticated image. */}
        <img
          alt={name}
          className="max-h-[75svh] max-w-full object-contain"
          onError={onError}
          src={src}
        />
      </div>
    );
  }
  if (kind === "audio") {
    return (
      // biome-ignore lint/a11y/useMediaCaption: User-supplied audio may lack a paired transcript.
      <audio
        aria-label={name}
        className="w-full"
        controls
        onError={onError}
        preload="metadata"
        src={src}
      />
    );
  }
  return (
    // biome-ignore lint/a11y/useMediaCaption: User-supplied video may lack a paired subtitle file.
    <video
      aria-label={name}
      className="mx-auto max-h-[75svh] w-full rounded-xl bg-black"
      controls
      onError={onError}
      playsInline
      preload="metadata"
      src={src}
    />
  );
}
