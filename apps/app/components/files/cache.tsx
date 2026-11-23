"use client";

import type { ReactNode } from "react";
import { SWRConfig } from "swr";

const config = {
  refreshInterval: 0,
  revalidateIfStale: true,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  shouldRetryOnError: false,
};

export function FilesCache({ children }: { readonly children: ReactNode }) {
  // SWR's default in-memory cache outlives locale layouts hidden by Next.js.
  return <SWRConfig value={config}>{children}</SWRConfig>;
}
