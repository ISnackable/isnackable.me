import "server-only";
import { getRedis } from "@repo/storage/redis";
import { FilesError } from "./errors";

export function requireFilesRedis() {
  const redis = getRedis();
  if (!redis) {
    throw new FilesError("unconfigured");
  }
  return redis;
}
