import "server-only";
import { FilesError } from "./errors";
import {
  type DriveBinding,
  type GraphDrive,
  type GraphItem,
  getGraphChildren,
  getGraphDownloadUrl,
  getGraphItem,
} from "./graph";
import { isFilePath, readBrowsePath } from "./paths";
import type {
  FileEntry,
  FileMetadata,
  FileProperties,
  FolderMetadata,
} from "./types";

interface LocatedEntry<T extends FileEntry> {
  readonly entry: T;
  readonly id: string;
}

export type PublishedFile = LocatedEntry<FileMetadata> & {
  readonly downloadUrl?: string;
  readonly properties?: FileProperties;
};
type PublishedFolder = LocatedEntry<FolderMetadata>;
export type PublishedEntry = PublishedFile | PublishedFolder;

export function driveItemPath(item: GraphItem, driveId: string) {
  const parent = item.parentReference;
  if (
    !(item.file || item.folder) ||
    item.remoteItem ||
    parent?.driveId !== driveId ||
    !parent.path
  ) {
    return null;
  }

  // Graph's reference is percent-encoded, with the drive-relative path after the colon.
  const colon = parent.path.indexOf(":");
  const suffix = parent.path.slice(colon + 1);
  if (colon < 0 || (suffix && !suffix.startsWith("/"))) {
    return null;
  }
  const segments = readBrowsePath(
    suffix.length > 1 ? suffix.slice(1).split("/") : []
  );
  if (!segments) {
    return null;
  }
  const path = [...segments, item.name];
  return isFilePath(path) ? path : null;
}

export function sameOneDrivePath(
  left: readonly string[],
  right: readonly string[]
) {
  return left.join("/").toLowerCase() === right.join("/").toLowerCase();
}

function publishedEntry(
  drive: DriveBinding,
  item: GraphItem
): PublishedEntry | null {
  const absolute = driveItemPath(item, drive.driveId);
  if (
    !(
      absolute &&
      drive.rootPath.every((part, index) => part === absolute[index])
    )
  ) {
    return null;
  }
  const path = absolute.slice(drive.rootPath.length);
  if (
    path.length === 0
      ? item.id !== drive.rootId || !item.folder
      : item.id === drive.rootId
  ) {
    return null;
  }

  const metadata = {
    modifiedAt: item.lastModifiedDateTime,
    name: item.name,
    path,
  };
  return item.folder
    ? { entry: { ...metadata, kind: "folder" }, id: item.id }
    : {
        downloadUrl: item["@microsoft.graph.downloadUrl"] ?? undefined,
        entry: { ...metadata, kind: "file", size: item.size },
        id: item.id,
        properties: item.file,
      };
}

export async function resolveEntry(
  drive: GraphDrive,
  path: readonly string[],
  options?: { download?: boolean; signal?: AbortSignal }
) {
  if (!isFilePath(path)) {
    throw new FilesError("invalid");
  }
  const item = await getGraphItem(drive, path, options);
  const resolved = publishedEntry(drive, item);
  if (!(resolved && sameOneDrivePath(resolved.entry.path, path))) {
    throw new FilesError(path.length === 0 ? "unconfigured" : "missing");
  }
  return resolved;
}

export function isPublishedFile(item: PublishedEntry): item is PublishedFile {
  return item.entry.kind === "file";
}

export async function getFileDownloadUrl(
  drive: GraphDrive,
  file: PublishedFile,
  signal?: AbortSignal
) {
  return (
    file.downloadUrl || (await getGraphDownloadUrl(drive, file.id, signal))
  );
}

export async function listFolderEntries(
  drive: GraphDrive,
  folder: { readonly id: string; readonly path: readonly string[] },
  nextLink?: string,
  signal?: AbortSignal
) {
  const page = await getGraphChildren(drive, folder.id, nextLink, signal);
  const folderPath = folder.path.join("/");
  const entries: PublishedEntry[] = [];
  for (const child of page.value) {
    const entry = publishedEntry(drive, child);
    if (
      child.parentReference?.id === folder.id &&
      entry &&
      entry.entry.path.length === folder.path.length + 1 &&
      entry.entry.path.slice(0, -1).join("/") === folderPath
    ) {
      entries.push(entry);
    }
  }
  return { entries, nextLink: page["@odata.nextLink"] };
}
