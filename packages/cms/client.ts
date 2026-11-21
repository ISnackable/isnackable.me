import "server-only";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, studioUrl } from "./env";

/**
 * Base Sanity client.
 *
 * - `useCdn: false` so queries hit the API directly — appropriate for
 *   server-side rendering and `generateStaticParams` where freshness matters.
 * - `stega.studioUrl` enables Visual Editing overlays to resolve back to the
 *   Studio on the portfolio origin. Overlays are only active in Draft Mode.
 *
 * For runtime live content served to browsers, prefer `cachedSanity` from
 * `./live.ts` which uses `defineLive` with the CDN enabled.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  stega: {
    studioUrl,
  },
});
