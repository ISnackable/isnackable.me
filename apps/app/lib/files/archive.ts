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
import { archiveEntryLimit } from "./limits";

interface ArchivePlan {
  readonly drive: PublishedDrive;
  readonly entries: Map<string, PublishedEntry>;
  remainingPages: number;
  readonly signal: AbortSignal;
}

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

async function archiveFile(
  file: PublishedFile,
  drive: PublishedDrive,
  signal: AbortSignal
) {
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

async function planArchiveEntry(allowed: PublishedEntry, plan: ArchivePlan) {
  const { entry } = allowed;
  const { drive, entries, signal } = plan;
  signal.throwIfAborted();
  const key = entry.path.join("/");
  if (entries.has(key)) {
    return;
  }
  if (entries.size >= archiveEntryLimit) {
    throw new FilesError("archive-limit");
  }
  entries.set(key, allowed);
  if (isPublishedFile(allowed)) {
    return;
  }

  let nextLink: string | undefined;
  do {
    signal.throwIfAborted();
    if (plan.remainingPages === 0) {
      throw new FilesError("archive-limit");
    }
    plan.remainingPages -= 1;
    // biome-ignore lint/performance/noAwaitInLoops: Graph returns the next page URL with each page.
    const page = await listFolderEntries(
      drive,
      { id: allowed.id, path: entry.path },
      nextLink,
      signal
    );
    for (const child of page.entries) {
      // biome-ignore lint/performance/noAwaitInLoops: Traverse folders sequentially to bound Graph requests.
      await planArchiveEntry(child, plan);
    }
    nextLink = page.nextLink;
  } while (nextLink);
}

async function* zipEntries(
  plan: ArchivePlan,
  base: readonly string[]
): AsyncGenerator<ZipEntry> {
  const { drive, entries, signal } = plan;
  for (const allowed of entries.values()) {
    signal.throwIfAborted();
    const { entry } = allowed;
    const name = entry.path.slice(base.length).join("/");
    const lastModified =
      entry.modifiedAt && Number.isFinite(Date.parse(entry.modifiedAt))
        ? new Date(entry.modifiedAt)
        : undefined;
    if (isPublishedFile(allowed)) {
      // biome-ignore lint/performance/noAwaitInLoops: Stream each file before opening the next one.
      const input = await archiveFile(allowed, drive, signal);
      if (input) {
        yield { input, lastModified, name };
      }
    } else if (name) {
      yield { lastModified, name: `${name}/` };
    }
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
  // Check traversal limits before returning attachment headers.
  const plan = {
    drive,
    entries: new Map<string, PublishedEntry>(),
    remainingPages: archiveEntryLimit,
    signal,
  };
  for (const root of roots) {
    // biome-ignore lint/performance/noAwaitInLoops: Share one work limit across all roots.
    await planArchiveEntry(root, plan);
  }
  const body = makeZip(zipEntries(plan, base));
  return new Response(body, {
    headers: {
      ...noStore,
      "Content-Disposition": attachment(`${name || "OneDrive"}.zip`),
      "Content-Type": "application/zip",
      "Cross-Origin-Resource-Policy": "same-origin",
    },
  });
}
