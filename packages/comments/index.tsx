"use client";

import Giscus from "@giscus/react";
import { useTheme } from "@repo/design-system/client";
import type { ReactElement } from "react";
import { type GiscusConfig, giscusLanguage } from "./config";

/** Giscus handles iframe updates when the theme or article changes during navigation. */
export function Comments({
  config,
  term,
  locale,
}: {
  config: GiscusConfig;
  term: string;
  locale: string;
}): ReactElement {
  const { resolvedTheme, theme } = useTheme();
  return (
    <Giscus
      {...config}
      emitMetadata="0"
      inputPosition="top"
      key={term}
      lang={giscusLanguage(locale)}
      loading="lazy"
      mapping="specific"
      reactionsEnabled="1"
      strict="1"
      term={term}
      theme={(resolvedTheme ?? theme) === "dark" ? "dark" : "light"}
    />
  );
}
