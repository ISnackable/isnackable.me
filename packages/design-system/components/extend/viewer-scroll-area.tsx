"use client";

import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";
import { ScrollBar } from "@repo/design-system/components/ui/scroll-area";
import { cn } from "@repo/design-system/lib/utils";
import { type Ref, useMemo } from "react";

type ViewerScrollAreaProps = ScrollAreaPrimitive.Root.Props & {
  readonly orientation?: "vertical" | "horizontal" | "both";
  readonly scrollFade?: boolean;
  readonly scrollbarGutter?: boolean;
  readonly viewportClassName?: string;
  readonly viewportProps?: ScrollAreaPrimitive.Viewport.Props;
  readonly viewportRef?: Ref<HTMLDivElement>;
};

export function ViewerScrollArea({
  className,
  children,
  orientation = "both",
  scrollFade = false,
  scrollbarGutter = false,
  viewportClassName,
  viewportProps,
  viewportRef,
  ...props
}: ViewerScrollAreaProps) {
  const {
    className: viewportPropsClassName,
    ref: viewportPropsRef,
    ...resolvedViewportProps
  } = viewportProps ?? {};
  const composedViewportRef = useMemo(
    () => composeRefs(viewportPropsRef, viewportRef),
    [viewportPropsRef, viewportRef]
  );

  return (
    <ScrollAreaPrimitive.Root
      className={cn("size-full min-h-0", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        {...resolvedViewportProps}
        className={cn(
          "h-full rounded-[inherit] outline-none focus-visible:ring-2 focus-visible:ring-ring",
          scrollFade &&
            "mask-t-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-y-start)))] mask-r-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-x-end)))] mask-b-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-y-end)))] mask-l-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-x-start)))] [--fade-size:1.5rem]",
          scrollbarGutter && orientation !== "vertical" && "pb-3.5",
          scrollbarGutter && orientation !== "horizontal" && "pe-3.5",
          viewportPropsClassName,
          viewportClassName
        )}
        data-slot="scroll-area-viewport"
        ref={composedViewportRef}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {orientation !== "horizontal" && <ScrollBar orientation="vertical" />}
      {orientation !== "vertical" && <ScrollBar orientation="horizontal" />}
      {orientation === "both" && <ScrollAreaPrimitive.Corner />}
    </ScrollAreaPrimitive.Root>
  );
}

function composeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) {
        continue;
      }
      if (typeof ref === "function") {
        ref(node);
      } else {
        ref.current = node;
      }
    }
  };
}
