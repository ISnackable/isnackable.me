interface EntryMetadata {
  readonly modifiedAt?: string;
  readonly name: string;
  readonly path: readonly string[];
}

export type FileEntry = EntryMetadata &
  (
    | { readonly kind: "file"; readonly size?: number }
    | { readonly kind: "folder"; readonly size?: never }
  );

export type FileMetadata = Extract<FileEntry, { kind: "file" }>;
export type FolderMetadata = Extract<FileEntry, { kind: "folder" }>;

export interface FileProperties {
  readonly hashes?: {
    readonly quickXorHash?: string | null;
    readonly sha1Hash?: string | null;
  } | null;
  readonly mimeType?: string | null;
}

export type FileDetails = FileMetadata & FileProperties;

interface FolderPage {
  readonly entries: readonly FileEntry[];
  readonly entry: FolderMetadata;
  readonly kind: "folder";
  readonly nextCursor: string | null;
}

export type BrowsePage =
  | FolderPage
  | { readonly entry: FileDetails; readonly kind: "file" };

export type FilesErrorCode =
  | "archive-limit"
  | "invalid"
  | "invalid-cursor"
  | "missing"
  | "rate-limited"
  | "unavailable"
  | "unconfigured";
