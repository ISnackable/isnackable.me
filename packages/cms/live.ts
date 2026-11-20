import { cookies, draftMode } from "next/headers";
import { connection } from "next/server";
import {
  defineLive,
  type LivePerspective,
  resolvePerspectiveFromCookies,
  resolveVariantFromCookies,
} from "next-sanity/live";
import { client } from "./client";
import { keys } from "./keys";

const { SANITY_API_READ_TOKEN } = keys();

const token = SANITY_API_READ_TOKEN || undefined;

/**
 * Live Content API setup. Provides `cachedSanity` for server components and
 * `SanityLive` for real-time revalidation in the root layout.
 *
 * When `SANITY_API_READ_TOKEN` is unset the client falls back to the public
 * CDN read path (drafts won't be visible).
 */
const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({
    useCdn: true,
    // Cache Components own Sanity's sync-tagged results. Bypass the untagged
    // fetch cache, which Next.js can reuse across production builds.
    requestHandler: (request, next) => {
      const requestFetch = request.fetch ?? globalThis.fetch;
      return next({
        ...request,
        fetch: (input, init) => {
          const options = { ...init, cache: "no-store" } satisfies RequestInit;
          return requestFetch(input, options);
        },
      });
    },
    ignoreBrowserTokenWarning: true,
  }),
  // Required for showing draft content when the Sanity Presentation Tool is used, or to enable the Vercel Toolbar Edit Mode
  serverToken: token || false,
  // Required for stand-alone live previews, the token is only shared to the browser if it's a valid Next.js Draft Mode session
  browserToken: token || false,
  strict: true,
});

export { SanityLive };

/** Cache keys include query, parameters, perspective, variant, and stega mode. */
export const cachedSanity: typeof sanityFetch = async (options) => {
  "use cache";
  return await sanityFetch(options);
};

export interface FetchOptions {
  perspective?: LivePerspective;
  stega?: boolean;
  variant?: string;
}

/** Resolve request-only preview state before crossing a shared cache boundary. */
export async function getDynamicFetchOptions(options: FetchOptions = {}) {
  if (options.perspective === "published") {
    return {
      perspective: "published" as const,
      stega: options.stega ?? false,
      variant: options.variant,
    };
  }

  const { isEnabled } = await draftMode();
  if (!(isEnabled && token)) {
    return { perspective: "published" as const, stega: options.stega ?? false };
  }

  // Draft Mode bypasses server caches; defer these reads until the request.
  await connection();
  const jar = await cookies();
  const perspective =
    options.perspective ??
    (await resolvePerspectiveFromCookies({ cookies: jar }));
  const variant =
    options.variant ?? (await resolveVariantFromCookies({ cookies: jar }));

  return { perspective, variant, stega: options.stega ?? true };
}
