import "server-only";
import { createHash } from "node:crypto";
import { after } from "next/server";
import { isPublishedFile, listFolderEntries, resolveEntry } from "./access";
import { openPublishedDrive, type PublishedDrive } from "./connection";
import { readCursor, sealCursor } from "./cursor";
import { FilesError } from "./errors";
import { requireFilesRedis } from "./redis";
import type { BrowsePage } from "./types";

const browseFreshSeconds = 15;
const browseStaleSeconds = 15;
const browseLifetimeSeconds = browseFreshSeconds + browseStaleSeconds;

interface BrowseSnapshot {
  readonly freshUntil: number;
  readonly page: BrowsePage;
}

// A refresh may finish after a cold request has populated a newer snapshot.
const replaceBrowseSnapshot = `
local current = redis.call("GET", KEYS[1])
if current and cjson.decode(current).freshUntil ~= tonumber(ARGV[1]) then return 0 end
redis.call("SET", KEYS[1], ARGV[2], "EX", ARGV[3])
return 1
`;

function snapshot(page: BrowsePage): BrowseSnapshot {
  return { freshUntil: Date.now() + browseFreshSeconds * 1000, page };
}

async function refreshSnapshot(
  redis: ReturnType<typeof requireFilesRedis>,
  key: string,
  freshUntil: number,
  load: () => Promise<BrowsePage>
) {
  // Claim one refresh per stale snapshot across server instances.
  const claim = await redis.set(`${key}:refresh:${freshUntil}`, "1", {
    ex: browseLifetimeSeconds,
    nx: true,
  });
  if (!claim) {
    return;
  }

  const refreshed = snapshot(await load());
  await redis.eval<[number, string, number], number>(
    replaceBrowseSnapshot,
    [key],
    [freshUntil, JSON.stringify(refreshed), browseLifetimeSeconds]
  );
}

async function readBrowsePage(
  drive: PublishedDrive,
  path: readonly string[],
  cursor: string | null,
  signal: AbortSignal
): Promise<BrowsePage> {
  // The configured root ID lets us fetch its children while verifying the root.
  const [item, rootPage] = await Promise.all([
    resolveEntry(drive, path, { signal }),
    path.length === 0 && cursor === null
      ? listFolderEntries(drive, { id: drive.rootId, path }, undefined, signal)
      : undefined,
  ]);
  if (isPublishedFile(item)) {
    if (cursor !== null) {
      throw new FilesError("invalid-cursor");
    }
    return { entry: item.entry, kind: "file" };
  }

  const nextLink =
    cursor === null
      ? undefined
      : readCursor(drive.connectionId, item.id, cursor);
  const page =
    rootPage ??
    (await listFolderEntries(
      drive,
      { id: item.id, path: item.entry.path },
      nextLink,
      signal
    ));
  return {
    entries: page.entries.map(({ entry }) => entry),
    entry: item.entry,
    kind: "folder",
    nextCursor: page.nextLink
      ? sealCursor(drive.connectionId, item.id, page.nextLink)
      : null,
  };
}

export async function browseFiles(
  path: readonly string[],
  cursor: string | null,
  signal: AbortSignal
) {
  const drive = await openPublishedDrive();
  if (cursor !== null) {
    return await readBrowsePage(drive, path, cursor, signal);
  }

  const redis = requireFilesRedis();
  const hash = createHash("sha256").update(path.join("/"));
  const key = `files:browse:v2:${drive.connectionId}:${hash.digest("hex")}`;
  const cached = await redis.get<BrowseSnapshot>(key).catch(() => null);
  const now = Date.now();
  if (cached && now < cached.freshUntil + browseStaleSeconds * 1000) {
    if (now >= cached.freshUntil) {
      after(() =>
        refreshSnapshot(redis, key, cached.freshUntil, () =>
          readBrowsePage(drive, path, null, AbortSignal.timeout(10_000))
        ).catch(() => undefined)
      );
    }
    return cached.page;
  }

  const page = await readBrowsePage(drive, path, null, signal);
  await redis
    .set(key, snapshot(page), { ex: browseLifetimeSeconds, nx: true })
    .catch(() => undefined);
  return page;
}
