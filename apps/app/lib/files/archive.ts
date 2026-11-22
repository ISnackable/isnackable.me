import "server-only";
import { makeZip } from "client-zip";
import {
  isPublishedFile,
  listFolderEntries,
  type PublishedEntry,
  type PublishedFile,
  resolveEntry,
} from "./access";
import { openPublishedDrive, type PublishedDrive } from "./connection";
import { fetchFile } from "./content";
import { FilesError, filesErrorCode } from "./errors";
import { attachment, noStore } from "./http";

interface ArchiveContext {
  readonly base: readonly string[];
  readonly drive: PublishedDrive;
  remainingPages: number;
  readonly seen: Set<string>;
  readonly signal: AbortSignal;
}

const entryLimit = 5000;

function sharedParent(roots: readonly PublishedEntry[]) {
  let base = roots[0].entry.path.slice(0, -1);
  for (const { entry } of roots.slice(1)) {
    const parent = entry.path.slice(0, -1);
    const firstDifference = base.findIndex(
      (segment, index) => segment !== parent[index]
    );
    if (firstDifference >= 0) {
      base = base.slice(0, firstDifference);
    }
  }
  return base;
}

type ZipEntry = {
  readonly lastModified?: Date;
  readonly name: string;
} & (
  | { readonly input: ReadableStream<Uint8Array> }
  | { readonly input?: never }
);

async function archiveFile(file: PublishedFile, context: ArchiveContext) {
  const { drive, signal } = context;
  let verified: PublishedEntry;
  try {
    verified = await resolveEntry(drive, file.entry.path, {
      download: true,
      signal,
    });
  } catch (error) {
    if (filesErrorCode(error) === "missing") {
      return null;
    }
    throw error;
  }
  if (!isPublishedFile(verified) || verified.id !== file.id) {
    return null;
  }
  const response = await fetchFile(drive, verified, { signal });
  if (!(response.ok && response.body)) {
    await response.body?.cancel();
    throw new FilesError("unavailable");
  }
  return response.body;
}

async function* zipEntries(
  allowed: PublishedEntry,
  context: ArchiveContext
): AsyncGenerator<ZipEntry> {
  const { entry } = allowed;
  const { seen, signal } = context;
  signal.throwIfAborted();
  const key = entry.path.join("/");
  if (seen.has(key)) {
    return;
  }
  if (seen.size >= entryLimit) {
    throw new FilesError("invalid");
  }
  seen.add(key);

  const name = entry.path.slice(context.base.length).join("/");
  const lastModified =
    entry.modifiedAt && Number.isFinite(Date.parse(entry.modifiedAt))
      ? new Date(entry.modifiedAt)
      : undefined;
  if (isPublishedFile(allowed)) {
    const input = await archiveFile(allowed, context);
    if (input) {
      yield { input, lastModified, name };
    }
    return;
  }

  if (name) {
    yield { lastModified, name: `${name}/` };
  }
  let nextLink: string | undefined;
  do {
    signal.throwIfAborted();
    context.remainingPages -= 1;
    if (context.remainingPages < 0) {
      throw new FilesError("invalid");
    }
    // biome-ignore lint/performance/noAwaitInLoops: Graph returns the next page URL with each page.
    const page = await listFolderEntries(
      context.drive,
      { id: allowed.id, path: entry.path },
      nextLink,
      signal
    );
    for (const child of page.entries) {
      yield* zipEntries(child, context);
    }
    nextLink = page.nextLink;
  } while (nextLink);
}

async function* archiveEntries(
  roots: readonly PublishedEntry[],
  context: ArchiveContext
) {
  for (const root of roots) {
    yield* zipEntries(root, context);
  }
}

export async function archiveResponse(
  paths: readonly string[][],
  signal: AbortSignal
) {
  const drive = await openPublishedDrive();
  const roots: PublishedEntry[] = [];
  for (const path of paths) {
    signal.throwIfAborted();
    // biome-ignore lint/performance/noAwaitInLoops: Bound Graph concurrency for user-selected paths.
    roots.push(await resolveEntry(drive, path, { signal }));
  }
  const base = sharedParent(roots);
  const name =
    roots.length === 1 && roots[0].entry.kind === "folder"
      ? roots[0].entry.name
      : base.at(-1);
  const body = makeZip(
    archiveEntries(roots, {
      base,
      drive,
      remainingPages: entryLimit,
      seen: new Set(),
      signal,
    })
  );
  return new Response(body, {
    headers: {
      ...noStore,
      "Content-Disposition": attachment(`${name || "OneDrive"}.zip`),
      "Content-Type": "application/zip",
      "Cross-Origin-Resource-Policy": "same-origin",
    },
  });
}
