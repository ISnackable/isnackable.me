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

interface FolderPage {
  readonly entries: readonly FileEntry[];
  readonly entry: FolderMetadata;
  readonly kind: "folder";
  readonly nextCursor: string | null;
}

export type BrowsePage =
  | FolderPage
  | { readonly entry: FileMetadata; readonly kind: "file" };

export interface SearchPage {
  readonly entries: readonly FileEntry[];
  readonly hasMore: boolean;
}

export type FilesErrorCode =
  | "invalid"
  | "invalid-cursor"
  | "missing"
  | "rate-limited"
  | "unavailable"
  | "unconfigured";
