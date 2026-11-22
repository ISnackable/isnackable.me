import "server-only";
import { FilesError, filesErrorCode } from "./errors";
import { archiveSelectionLimit, filePathLimit } from "./limits";
import { readFilePath } from "./paths";

export const noStore = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};

// A percent-encoded UTF-16 code unit uses at most nine bytes, plus the form field overhead.
const archiveBodyLimit =
  archiveSelectionLimit * (filePathLimit * 9 + "path=&".length);

const status = {
  invalid: 400,
  "invalid-cursor": 400,
  missing: 404,
  "rate-limited": 429,
  unconfigured: 503,
  unavailable: 503,
};

export function jsonError(error: unknown) {
  const code = filesErrorCode(error);
  return Response.json(
    { error: code },
    { headers: noStore, status: status[code] }
  );
}

export function pathFromQuery(query: URLSearchParams) {
  const path = readFilePath(query.get("path"));
  if (!path || query.getAll("path").length !== 1) {
    throw new FilesError("invalid");
  }
  return path;
}

export async function readArchivePaths(request: Request) {
  const type = request.headers.get("content-type")?.split(";")[0];
  if (!request.body || type !== "application/x-www-form-urlencoded") {
    throw new FilesError("invalid");
  }

  let bytes = 0;
  const body = request.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        bytes += chunk.byteLength;
        if (bytes > archiveBodyLimit) {
          throw new FilesError("invalid");
        }
        controller.enqueue(chunk);
      },
    })
  );
  const form = new URLSearchParams(await new Response(body).text());
  const paths = new Set(form.getAll("path"));
  if (paths.size === 0 || paths.size > archiveSelectionLimit) {
    throw new FilesError("invalid");
  }
  return Array.from(paths, (value) => {
    const path = readFilePath(value);
    if (!path) {
      throw new FilesError("invalid");
    }
    return path;
  });
}

export function attachment(name: string) {
  const fallback = name.replace(/[^A-Za-z0-9._ -]/g, "_");
  const encoded = encodeURIComponent(name).replace(
    /[!'()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  );
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}
