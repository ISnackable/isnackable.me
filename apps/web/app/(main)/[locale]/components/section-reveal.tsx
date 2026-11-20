"use client";

import { cn } from "@repo/design-system/lib/utils";
import { type ReactNode, useEffect, useRef } from "react";

/** Add reveals after hydration without adding hidden styles to server markup. */
export function SectionReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (
      !(element && window.IntersectionObserver) ||
      element.getBoundingClientRect().top < window.innerHeight
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          element.dataset.reveal = "visible";
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -32px 0px" }
    );

    element.dataset.reveal = "pending";
    observer.observe(element);
    return () => {
      observer.disconnect();
      delete element.dataset.reveal;
    };
  }, []);

  return (
    <div className={cn("section-reveal", className)} ref={ref}>
      {children}
    </div>
  );
}
