"use client";

import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { parseBlogFilters } from "@/lib/blog-discovery";

/** URL data resolves synchronously on navigation, even before the server responds. */
export function ResultsShell({
  children,
  loading,
}: {
  children: ReactNode;
  loading: ReactNode;
}) {
  const params = useSearchParams();
  const filters = parseBlogFilters({
    q: params.get("q") ?? undefined,
    tag: params.get("tag") ?? undefined,
    page: params.get("page") ?? undefined,
  });
  // Only the unfiltered first page can use the prefetched default result.
  return filters.q || filters.tag || filters.page > 1 ? loading : children;
}
