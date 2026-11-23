import "server-only";
import { Redis } from "@upstash/redis";
import { keys } from "./keys";

let client: Redis | undefined;

/** Shared Redis connection. Each consumer owns its key namespace and data model. */
export function getRedis() {
  const { KV_REST_API_TOKEN: token, KV_REST_API_URL: url } = keys();
  if (!(token && url)) {
    return;
  }
  client ??= new Redis({ token, url, signal: () => AbortSignal.timeout(8000) });
  return client;
}
