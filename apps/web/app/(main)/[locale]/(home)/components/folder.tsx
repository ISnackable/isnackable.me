"use client";

import { useTheme } from "@repo/design-system/client";
import ReactBitsFolder from "@repo/design-system/components/Folder";
import {
  Children,
  type CSSProperties,
  isValidElement,
  type ReactNode,
  useSyncExternalStore,
} from "react";

const desktopQuery = "(min-width: 80rem)";
const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(desktopQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const getDesktop = () => window.matchMedia(desktopQuery).matches;
const getServerDesktop = () => false;

// Solid mode reads CSS variables directly. The material reuses ImagesBadge's
// amber palette, while the paper and focus styles follow the portfolio theme.
const folderTheme = {
  "--folder-base":
    "color-mix(in oklch, var(--hero-folder-front-top), var(--hero-folder-front-bottom))",
  "--folder-front-top": "var(--hero-folder-front-top)",
  "--folder-front-bottom": "var(--hero-folder-front-bottom)",
  "--folder-inside-top": "var(--hero-folder-back-top)",
  "--folder-inside-bottom": "var(--hero-folder-back-bottom)",
  "--folder-tab-ink": "var(--color-amber-950)",
  "--folder-paper": "var(--card)",
  "--folder-paper-text": "var(--card-foreground)",
  "--folder-focus": "var(--ring)",
  "--folder-ground": "color-mix(in oklch, var(--foreground) 14%, transparent)",
  "--folder-ground-soft":
    "color-mix(in oklch, var(--foreground) 8%, transparent)",
} as CSSProperties;

export function Folder({
  children,
  label,
}: {
  children?: ReactNode;
  label: string;
}) {
  const desktop = useSyncExternalStore(subscribe, getDesktop, getServerDesktop);
  const { resolvedTheme } = useTheme();
  const entries = Children.toArray(children).filter(isValidElement).slice(0, 3);

  if (!entries.length) {
    return null;
  }

  return (
    <div className="hero-folder">
      <ReactBitsFolder
        bounce={0.2}
        className="hero-folder-visual"
        draggable={false}
        intro={false}
        label={label}
        size={desktop ? 0.9 : 0.4}
        speed={1.6}
        style={folderTheme}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        tilt={desktop ? 0.25 : 0}
        variant="solid"
        zoomOnClick={false}
      >
        {entries}
      </ReactBitsFolder>
    </div>
  );
}
