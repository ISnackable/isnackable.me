import "server-only";
import { createHmac } from "node:crypto";
import { z } from "zod";
import { openJson, sealJson } from "./crypto";
import { FilesError } from "./errors";
import { getSettings } from "./settings";

const cursorLifetime = 60 * 60 * 1000;
const cursorPattern = /^[\w-]{39,16384}$/;
const cursor = z.object({
  connectionId: z.uuid(),
  expiresAt: z.number().int(),
  folderId: z.string(),
  nextLink: z.string(),
});

function cursorKey() {
  return createHmac("sha256", getSettings().secret)
    .update("file-list-cursor:v2")
    .digest();
}

export function sealCursor(
  connectionId: string,
  folderId: string,
  nextLink: string
) {
  return sealJson(
    {
      connectionId,
      expiresAt: Date.now() + cursorLifetime,
      folderId,
      nextLink,
    },
    cursorKey()
  );
}

export function readCursor(
  connectionId: string,
  folderId: string,
  value: string
) {
  if (!cursorPattern.test(value)) {
    throw new FilesError("invalid-cursor");
  }
  try {
    const result = cursor.parse(openJson(value, cursorKey()));
    if (
      result.connectionId === connectionId &&
      result.folderId === folderId &&
      result.expiresAt > Date.now()
    ) {
      return result.nextLink;
    }
  } catch {
    // biome-ignore lint/style/useErrorCause: Keep malformed cursor payloads out of error details.
    throw new FilesError("invalid-cursor");
  }
  throw new FilesError("invalid-cursor");
}
