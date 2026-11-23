import "server-only";
import {
  getFileDownloadUrl,
  isPublishedFile,
  type PublishedFile,
  resolveEntry,
} from "./access";
import { openPublishedDrive, type PublishedDrive } from "./connection";
import { FilesError } from "./errors";
import { fetchGraphContent, getGraphThumbnail } from "./graph";
import { attachment, jsonError, noStore, pathFromQuery } from "./http";
import { canPreview, previewType, textPreviewLimit } from "./preview";

const singleRange = /^bytes=(\d*)-(\d*)$/;
const thumbnailMime = /^image\/(?:png|jpeg|webp|avif|gif)$/i;

function isValidRange(range: string | null, size?: number) {
  if (range === null) {
    return true;
  }
  const parsed = singleRange.exec(range);
  if (!(parsed && (parsed[1] || parsed[2]))) {
    return false;
  }
  const first = Number(parsed[1]);
  const last = Number(parsed[2]);
  return (
    size !== 0 &&
    Number.isSafeInteger(first) &&
    Number.isSafeInteger(last) &&
    (parsed[1] ? size === undefined || first < size : last > 0) &&
    (!(parsed[1] && parsed[2]) || first <= last)
  );
}

export const publicContentHeaders = {
  ...noStore,
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Expose-Headers":
    "Accept-Ranges, Content-Disposition, Content-Range",
  "Cross-Origin-Resource-Policy": "cross-origin",
};

function rangeUnavailable(headers: Headers, size?: number) {
  headers.delete("Content-Disposition");
  headers.delete("Content-Type");
  if (size !== undefined) {
    headers.set("Content-Range", `bytes */${size}`);
  }
  return new Response(null, { headers, status: 416 });
}

async function publishedFile(
  drive: PublishedDrive,
  path: readonly string[],
  download: boolean,
  signal: AbortSignal
) {
  const file = await resolveEntry(drive, path, { download, signal });
  if (!isPublishedFile(file)) {
    throw new FilesError("missing");
  }
  return file;
}

export async function fetchFile(
  drive: PublishedDrive,
  file: PublishedFile,
  options?: { range?: string; signal?: AbortSignal }
) {
  const location = await getFileDownloadUrl(drive, file, options?.signal);
  return await fetchGraphContent(drive.contentHosts, location, options);
}

async function fileResponse(
  drive: PublishedDrive,
  path: readonly string[],
  options: {
    head: boolean;
    preview: boolean;
    range: string | null;
    signal: AbortSignal;
  }
) {
  const file = await publishedFile(drive, path, !options.head, options.signal);
  const { name, size } = file.entry;
  const type = previewType(name);
  const media =
    type.kind === "image" || type.kind === "audio" || type.kind === "video";
  const textPreview =
    options.preview &&
    (type.kind === "text" || type.kind === "markdown" || type.kind === "link");
  if (options.preview && !canPreview(type, size)) {
    throw new FilesError("missing");
  }
  const headers = new Headers(publicContentHeaders);
  headers.set("Accept-Ranges", "bytes");
  if (!(options.head || isValidRange(options.range, size))) {
    return rangeUnavailable(headers, size);
  }

  headers.set("Content-Type", type.mime);
  if (!(options.preview && media)) {
    headers.set("Content-Disposition", attachment(name));
  }
  if (options.head) {
    if (size !== undefined) {
      headers.set("Content-Length", String(size));
    }
    return new Response(null, { headers });
  }

  const upstream = await fetchFile(drive, file, {
    range: options.range ?? undefined,
    signal: options.signal,
  });
  return await pipeContent(upstream, headers, size, textPreview);
}

async function pipeContent(
  upstream: Response,
  headers: Headers,
  size: number | undefined,
  textPreview: boolean
) {
  if (!upstream.ok) {
    await upstream.body?.cancel();
    if (upstream.status === 416) {
      return rangeUnavailable(headers, size);
    }
    throw new FilesError(upstream.status === 404 ? "missing" : "unavailable");
  }
  const length = upstream.headers.get("content-length");
  const contentRange = upstream.headers.get("content-range");
  const encoding = upstream.headers.get("content-encoding");
  if (length && (!encoding || encoding === "identity")) {
    headers.set("Content-Length", length);
  }
  if (contentRange && upstream.status === 206) {
    headers.set("Content-Range", contentRange);
  }

  let body = upstream.body;
  if (textPreview && body) {
    let bytes = 0;
    body = body.pipeThrough(
      new TransformStream<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>({
        transform(chunk, controller) {
          bytes += chunk.byteLength;
          if (bytes > textPreviewLimit) {
            throw new FilesError("unavailable");
          }
          controller.enqueue(chunk);
        },
      })
    );
  }
  return new Response(body, { headers, status: upstream.status });
}

export async function serveFileRequest(request: Request) {
  const head = request.method === "HEAD";
  const query = new URL(request.url).searchParams;
  try {
    const path = pathFromQuery(query);
    return await fileResponse(await openPublishedDrive(), path, {
      head,
      preview: query.get("preview") === "1",
      range: request.headers.get("range"),
      signal: request.signal,
    });
  } catch (error) {
    const response = jsonError(error);
    return head
      ? new Response(null, {
          headers: response.headers,
          status: response.status,
        })
      : response;
  }
}

export async function serveThumbnailRequest(request: Request) {
  const query = new URL(request.url).searchParams;
  try {
    const path = pathFromQuery(query);
    const drive = await openPublishedDrive();
    const file = await publishedFile(drive, path, false, request.signal);
    const location = await getGraphThumbnail(drive, file.id, request.signal);
    const upstream = await fetchGraphContent(drive.contentHosts, location, {
      signal: request.signal,
    });
    const type = upstream.headers.get("content-type");
    if (!(upstream.ok && type && thumbnailMime.test(type))) {
      await upstream.body?.cancel();
      throw new FilesError("missing");
    }
    const headers = new Headers(publicContentHeaders);
    headers.set("Content-Type", type);
    return new Response(upstream.body, { headers });
  } catch (error) {
    return jsonError(error);
  }
}
