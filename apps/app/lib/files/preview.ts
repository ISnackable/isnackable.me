const images = {
  avif: "image/avif",
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;
const audio = {
  aac: "audio/aac",
  flac: "audio/flac",
  m4a: "audio/mp4",
  mp3: "audio/mpeg",
  oga: "audio/ogg",
  ogg: "audio/ogg",
  opus: "audio/ogg",
  wav: "audio/wav",
} as const;
const video = {
  m4v: "video/mp4",
  mov: "video/quicktime",
  mp4: "video/mp4",
  ogv: "video/ogg",
  webm: "video/webm",
} as const;
const documents = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
} as const;
const markdown = new Set(["markdown", "md", "mdown"]);
const textMime = "text/plain; charset=utf-8";
const shortcutLine = /^URL[ \t]*=[ \t]*(.+)$/im;
const text = new Set([
  "c",
  "cpp",
  "cs",
  "css",
  "csv",
  "diff",
  "go",
  "h",
  "html",
  "java",
  "js",
  "json",
  "jsx",
  "log",
  "mjs",
  "py",
  "rs",
  "sh",
  "sql",
  "srt",
  "toml",
  "ts",
  "tsx",
  "tsv",
  "txt",
  "vue",
  "vtt",
  "xml",
  "yaml",
  "yml",
]);

export type DocumentFormat = keyof typeof documents;
export const textPreviewLimit = 512 * 1024;
const documentPreviewLimit = 25 * 1024 * 1024;

function mimeFrom<T extends Record<string, string>>(
  table: T,
  extension: string
) {
  return Object.hasOwn(table, extension) ? table[extension] : undefined;
}

export function previewType(name: string) {
  const extension = name.includes(".")
    ? (name.split(".").at(-1) ?? "").toLowerCase()
    : "";
  const imageType = mimeFrom(images, extension);
  if (imageType) {
    return { kind: "image", mime: imageType } as const;
  }
  const audioType = mimeFrom(audio, extension);
  if (audioType) {
    return { kind: "audio", mime: audioType } as const;
  }
  const videoType = mimeFrom(video, extension);
  if (videoType) {
    return { kind: "video", mime: videoType } as const;
  }
  const documentType = mimeFrom(documents, extension);
  if (documentType) {
    return {
      format: extension as DocumentFormat,
      kind: "document",
      mime: documentType,
    } as const;
  }
  if (markdown.has(extension)) {
    return { kind: "markdown", mime: textMime } as const;
  }
  if (extension === "url") {
    return { kind: "link", mime: textMime } as const;
  }
  if (text.has(extension)) {
    return { kind: "text", mime: textMime } as const;
  }
  return { kind: "unknown", mime: "application/octet-stream" } as const;
}

export function canPreview(
  type: ReturnType<typeof previewType>,
  size?: number
) {
  switch (type.kind) {
    case "unknown":
      return false;
    case "document":
      return (size ?? Number.POSITIVE_INFINITY) <= documentPreviewLimit;
    case "link":
    case "markdown":
    case "text":
      return (size ?? Number.POSITIVE_INFINITY) <= textPreviewLimit;
    default:
      return true;
  }
}

export function shortcutUrl(body: string) {
  const target = shortcutLine.exec(body)?.[1]?.trim();
  const url = target && URL.parse(target);
  return url &&
    (url.protocol === "https:" || url.protocol === "http:") &&
    !url.username &&
    !url.password
    ? url.href
    : null;
}
