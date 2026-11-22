import "server-only";
import { setTimeout as wait } from "node:timers/promises";
import { z } from "zod";
import { FilesError } from "./errors";
import { graphOrigin } from "./microsoft";
import { encodeFilePath } from "./paths";
import { contentHostname, oneDriveId } from "./settings";

const metadataFields =
  "id,name,size,folder,file,lastModifiedDateTime,parentReference,remoteItem";
const downloadField = "@microsoft.graph.downloadUrl";
const folderPageSize = 200;
const item = z.object({
  [downloadField]: z.string().nullish(),
  file: z.object({}).optional(),
  folder: z.object({}).optional(),
  id: oneDriveId,
  lastModifiedDateTime: z.string().optional(),
  name: z.string(),
  parentReference: z
    .object({
      driveId: z.string().optional(),
      id: z.string().optional(),
      path: z.string().optional(),
    })
    .optional(),
  remoteItem: z.unknown().optional(),
  size: z.number().nonnegative().optional(),
});
const collection = z.object({
  "@odata.nextLink": z.string().optional(),
  value: z.array(item),
});
const thumbnails = z.object({
  value: z.array(
    z.object({ medium: z.object({ url: z.string() }).optional() })
  ),
});
const oneDrive = z.object({
  driveType: z.enum(["personal", "business"]),
  id: oneDriveId,
});
const itemBatch = z.object({
  responses: z.array(
    z.object({ body: z.unknown(), id: oneDriveId, status: z.number() })
  ),
});

export type GraphItem = z.infer<typeof item>;

interface GraphCredentials {
  readonly accessToken: () => string;
  readonly refresh?: (rejectedToken: string) => Promise<string>;
}

export interface DriveBinding {
  readonly driveId: string;
  readonly rootId: string;
  readonly rootPath: readonly string[];
}

export type GraphDrive = DriveBinding & GraphCredentials;

interface GraphRequestOptions {
  readonly body?: string;
  readonly redirect?: "error" | "manual";
  readonly signal?: AbortSignal;
}

function graphRequest(
  url: URL,
  token: string,
  { body, redirect = "error", signal }: GraphRequestOptions
) {
  const timeout = AbortSignal.timeout(10_000);
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (body) {
    headers["Content-Type"] = "application/json";
  }
  return fetch(url, {
    body,
    cache: "no-store",
    headers,
    method: body ? "POST" : "GET",
    redirect,
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });
}

async function graphResponse(
  credentials: GraphCredentials,
  url: URL,
  options: GraphRequestOptions = {}
) {
  const { signal, redirect } = options;
  let token = credentials.accessToken();
  let response = await graphRequest(url, token, options);
  if (response.status === 401 && credentials.refresh) {
    await response.body?.cancel();
    signal?.throwIfAborted();
    token = await credentials.refresh(token);
    response = await graphRequest(url, token, options);
  }
  if (response.status === 429 || response.status === 503) {
    const retryAfter = Number(response.headers.get("retry-after") ?? 1);
    if (retryAfter >= 0 && retryAfter <= 2) {
      await response.body?.cancel();
      await wait(retryAfter * 1000, undefined, { signal });
      response = await graphRequest(url, token, options);
    }
  }

  if (!(response.ok || (redirect === "manual" && response.status === 302))) {
    await response.body?.cancel();
    if (response.status === 404) {
      throw new FilesError("missing");
    }
    throw new FilesError(
      response.status === 429 ? "rate-limited" : "unavailable"
    );
  }
  return response;
}

async function graphJson<T>(
  credentials: GraphCredentials,
  url: URL,
  schema: z.ZodType<T>,
  options?: GraphRequestOptions
): Promise<T> {
  const response = await graphResponse(credentials, url, options);
  return schema.parse(await response.json());
}

function driveItemUrl(driveId: string, itemId: string) {
  return new URL(
    `/v1.0/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(itemId)}`,
    graphOrigin
  );
}

export function getOwnerDrive(credentials: GraphCredentials) {
  const url = new URL("/v1.0/me/drive", graphOrigin);
  url.searchParams.set("$select", "driveType,id");
  return graphJson(credentials, url, oneDrive);
}

export function getOwnerFolder(
  credentials: GraphCredentials,
  path: readonly string[]
) {
  const url = new URL(
    `/v1.0/me/drive/root:/${encodeFilePath(path)}`,
    graphOrigin
  );
  url.searchParams.set("$select", metadataFields);
  return graphJson(credentials, url, item);
}

export function getGraphItem(
  drive: GraphDrive,
  path: readonly string[],
  options?: { download?: boolean; signal?: AbortSignal }
) {
  const url = driveItemUrl(drive.driveId, drive.rootId);
  if (path.length > 0) {
    url.pathname += `:/${encodeFilePath(path)}`;
  }
  // Personal OneDrive returns the download annotation with Graph's select syntax.
  url.searchParams.set(
    options?.download ? "select" : "$select",
    options?.download ? `${metadataFields},${downloadField}` : metadataFields
  );
  return graphJson(drive, url, item, { signal: options?.signal });
}

export async function getGraphDownloadUrl(
  drive: GraphDrive,
  fileId: string,
  signal?: AbortSignal
) {
  const url = driveItemUrl(drive.driveId, fileId);
  url.pathname += "/content";
  // The signed URL is fetched separately after the content host is checked.
  const response = await graphResponse(drive, url, {
    redirect: "manual",
    signal,
  });
  const location =
    response.status === 302 ? response.headers.get("location") : null;
  await response.body?.cancel();
  if (!location) {
    throw new FilesError("unavailable");
  }
  return location;
}

export function getGraphChildren(
  drive: GraphDrive,
  folderId: string,
  nextLink?: string,
  signal?: AbortSignal
) {
  const listing = driveItemUrl(drive.driveId, folderId);
  listing.pathname += "/children";
  listing.searchParams.set("$select", metadataFields);
  listing.searchParams.set("$top", String(folderPageSize));
  listing.searchParams.set("$orderby", "name asc");

  const url = nextLink ? URL.parse(nextLink) : listing;
  if (
    !url ||
    url.origin !== listing.origin ||
    url.username ||
    url.password ||
    url.hash ||
    decodeURIComponent(url.pathname) !== decodeURIComponent(listing.pathname)
  ) {
    throw new FilesError("unavailable");
  }
  return graphJson(drive, url, collection, { signal });
}

export function getGraphMatches(
  drive: GraphDrive,
  text: string,
  limit: number,
  signal?: AbortSignal
) {
  const url = driveItemUrl(drive.driveId, drive.rootId);
  const escaped = encodeURIComponent(text.replaceAll("'", "''")).replaceAll(
    "'",
    "%27"
  );
  url.pathname += `/search(q='${escaped}')`;
  url.searchParams.set("$select", metadataFields);
  url.searchParams.set("$top", String(limit));
  return graphJson(drive, url, collection, { signal });
}

export async function getGraphItemsById(
  drive: GraphDrive,
  ids: readonly string[],
  signal?: AbortSignal
) {
  const url = new URL("/v1.0/$batch", graphOrigin);
  const batches: Promise<z.infer<typeof itemBatch>>[] = [];
  const batchLimit = 20;
  for (let offset = 0; offset < ids.length; offset += batchLimit) {
    const requests = ids.slice(offset, offset + batchLimit).map((id) => {
      const target = driveItemUrl(drive.driveId, id);
      target.searchParams.set("$select", metadataFields);
      return {
        id,
        method: "GET",
        url: target.pathname.slice("/v1.0".length) + target.search,
      };
    });
    batches.push(
      graphJson(drive, url, itemBatch, {
        body: JSON.stringify({ requests }),
        signal,
      })
    );
  }

  const items = new Map<string, GraphItem>();
  for (const { responses } of await Promise.all(batches)) {
    for (const response of responses) {
      if (response.status === 200) {
        const entry = item.parse(response.body);
        if (entry.id === response.id) {
          items.set(entry.id, entry);
        }
      }
    }
  }
  return items;
}

export async function getGraphThumbnail(
  drive: GraphDrive,
  id: string,
  signal?: AbortSignal
) {
  const url = driveItemUrl(drive.driveId, id);
  url.pathname += "/thumbnails";
  const result = await graphJson(drive, url, thumbnails, { signal });
  const location = result.value[0]?.medium?.url;
  if (!location) {
    throw new FilesError("missing");
  }
  return location;
}

export function parseContentUrl(location: string, base?: URL) {
  const url = URL.parse(location, base);
  if (
    url?.protocol !== "https:" ||
    url.port ||
    url.username ||
    url.password ||
    !contentHostname.safeParse(url.hostname).success
  ) {
    return null;
  }
  return url;
}

export async function fetchGraphContent(
  contentHosts: ReadonlySet<string>,
  location: string,
  options: { range?: string; signal?: AbortSignal } = {}
) {
  let url = parseContentUrl(location);
  const headers = new Headers({ "Accept-Encoding": "identity" });
  if (options.range) {
    headers.set("Range", options.range);
  }

  for (let count = 0; url && count < 4; count += 1) {
    if (!contentHosts.has(url.hostname)) {
      break;
    }
    // biome-ignore lint/performance/noAwaitInLoops: Check the exact host at every redirect hop.
    const response = await fetch(url, {
      cache: "no-store",
      headers,
      redirect: "manual",
      signal: options.signal,
    });
    if (response.status < 300 || response.status >= 400) {
      return response;
    }
    await response.body?.cancel();
    const redirected = response.headers.get("location");
    url = redirected ? parseContentUrl(redirected, url) : null;
  }
  throw new FilesError("unavailable");
}
