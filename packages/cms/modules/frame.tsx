import { cn } from "@repo/design-system/lib/utils";
import type { ReactNode } from "react";
import { moduleAnchorId } from "./anchors";
import type { ModuleAttributes } from "./types";

export function ModuleFrame({
  attributes,
  children,
  className,
  moduleKey,
  type,
}: {
  attributes?: ModuleAttributes | null;
  children: ReactNode;
  className?: string;
  moduleKey: string;
  type: string;
}) {
  if (attributes?.hidden) {
    return null;
  }
  return (
    <div
      className={cn("scroll-mt-24", className)}
      data-module={type}
      id={moduleAnchorId(moduleKey, attributes)}
    >
      {children}
    </div>
  );
}
