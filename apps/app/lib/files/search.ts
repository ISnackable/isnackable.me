import "server-only";
import { publishedEntry, resolveEntry } from "./access";
import { openPublishedDrive } from "./connection";
import { getGraphItemsById, getGraphMatches } from "./graph";
import type { FileEntry, SearchPage } from "./types";

const resultLimit = 30;

export async function searchFiles(
  text: string,
  signal?: AbortSignal
): Promise<SearchPage> {
  const drive = await openPublishedDrive();
  const [, page] = await Promise.all([
    resolveEntry(drive, [], { signal }),
    getGraphMatches(drive, text, resultLimit, signal),
  ]);
  const candidates = page.value.slice(0, resultLimit);
  const missingPaths = new Set<string>();
  for (const item of candidates) {
    const parent = item.parentReference;
    if (
      parent?.id &&
      !parent.path &&
      (!parent.driveId || parent.driveId === drive.driveId) &&
      !item.remoteItem
    ) {
      missingPaths.add(item.id);
    }
  }
  // Work and school search hits can omit the parent path.
  const details = await getGraphItemsById(drive, [...missingPaths], signal);
  const matches = new Map<string, FileEntry>();
  for (const item of candidates) {
    const found = publishedEntry(drive, details.get(item.id) ?? item);
    if (found?.entry.path.length) {
      matches.set(found.entry.path.join("/"), found.entry);
    }
  }
  return {
    entries: [...matches.values()],
    hasMore:
      Boolean(page["@odata.nextLink"]) || page.value.length > resultLimit,
  };
}
