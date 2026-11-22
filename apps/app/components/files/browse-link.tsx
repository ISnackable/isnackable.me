"use client";

import type { Locale } from "@repo/internationalization/locales";
import Link from "next/link";
import type { ComponentProps } from "react";
import { preload, useSWRConfig } from "swr";
import { unstable_serialize as serializeInfinite } from "swr/infinite";
import { fetchFilesJson } from "@/lib/files/client";
import { browseHref, filesApiHref } from "@/lib/files/paths";
import type { BrowsePage } from "@/lib/files/types";

type BrowseLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  readonly locale: Locale;
  readonly path: readonly string[];
};

export function BrowseLink({
  locale,
  onNavigate,
  path,
  ...props
}: BrowseLinkProps) {
  const { cache } = useSWRConfig();

  return (
    <Link
      {...props}
      href={browseHref(locale, path)}
      onNavigate={(event) => {
        const key = filesApiHref("browse", path);
        const listing = cache.get(serializeInfinite(() => key));
        if (!(listing?.data || listing?.isValidating)) {
          void preload(key, fetchFilesJson<BrowsePage>).catch(() => undefined);
        }
        onNavigate?.(event);
      }}
    />
  );
}
