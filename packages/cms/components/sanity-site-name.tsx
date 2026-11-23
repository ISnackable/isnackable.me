import "server-only";
import { siteConfig } from "@repo/config/site";
import { Suspense } from "react";
import { resolveSiteSettings } from "../content/site";
import type { FetchOptions } from "../live";

export function SanitySiteName({
  fetchOptions,
}: {
  fetchOptions?: FetchOptions;
}) {
  return (
    <Suspense fallback={siteConfig.name}>
      <SiteName fetchOptions={fetchOptions} />
    </Suspense>
  );
}

async function SiteName({ fetchOptions }: { fetchOptions?: FetchOptions }) {
  // Only initialize the Sanity client when a configured app renders the name.
  const { settings } = await import("../data/settings");
  const site = resolveSiteSettings(await settings.get(fetchOptions));
  return site.name;
}
