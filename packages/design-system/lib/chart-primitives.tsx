// Adapted from EasyUI. The MIT notice is in components/ui/activity-heatmap.tsx.
"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { motion, useReducedMotion, useSpring } from "motion/react";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
export const fullFmt = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

/** Container width via ResizeObserver (initial value keeps SSR output sensible) */
export function useElementWidth<T extends HTMLElement>(initial: number) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(initial);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(Math.round(el.clientWidth) || initial);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [initial]);
  return [ref, width] as const;
}

/** Clear a hover/tap selection when the user taps outside the chart (touch) */
export function useDismissOutside(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  close: () => void,
) {
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("pointerdown", down);
    return () => document.removeEventListener("pointerdown", down);
  }, [ref, open, close]);
}

/* ---------------------------------- Tooltip -------------------------------- */

export function Tooltip({
  pos,
  boundsWidth,
  children,
}: {
  pos: { x: number; y: number } | null;
  boundsWidth: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useRef(false);
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 520, damping: 42, mass: 0.6 });
  const y = useSpring(0, { stiffness: 520, damping: 42, mass: 0.6 });

  useLayoutEffect(() => {
    if (!pos) {
      seen.current = false;
      return;
    }
    const w = ref.current?.offsetWidth ?? 130;
    const h = ref.current?.offsetHeight ?? 60;

    // Stay inside the chart, then nudge back inside the viewport so the
    // tooltip never gets clipped when the card sits near a screen edge.
    let tx = clamp(pos.x - w / 2, 0, Math.max(0, boundsWidth - w));

    // Prefer above the anchor, flip below when the top is cramped, and clamp
    // to the viewport when neither side has enough room.
    let ty = pos.y - h - 12;

    const host = ref.current?.offsetParent as HTMLElement | null;
    const box = host?.getBoundingClientRect();
    if (box && typeof window !== "undefined") {
      const pad = 8;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      tx = clamp(
        tx,
        pad - box.left,
        Math.max(pad - box.left, vw - pad - w - box.left),
      );

      const anchorY = box.top + pos.y;
      const spaceAbove = anchorY - pad;
      const spaceBelow = vh - pad - anchorY;
      if (spaceAbove < h + 12 && spaceBelow > spaceAbove) ty = pos.y + 18;
      ty = clamp(
        ty,
        pad - box.top,
        Math.max(pad - box.top, vh - pad - h - box.top),
      );
    } else if (ty < 0) {
      ty = pos.y + 18;
    }

    if (reduce || !seen.current) {
      x.jump(tx);
      y.jump(ty);
      seen.current = true;
    } else {
      x.set(tx);
      y.set(ty);
    }
  }, [pos, boundsWidth, reduce, x, y]);

  return (
    <motion.div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute top-0 left-0 z-20 min-w-28 rounded-lg border bg-popover px-3 py-2 text-popover-foreground text-xs shadow-lg"
      style={{ x, y }}
      initial={false}
      animate={{ opacity: pos ? 1 : 0 }}
      transition={{ duration: reduce ? 0 : 0.14, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
