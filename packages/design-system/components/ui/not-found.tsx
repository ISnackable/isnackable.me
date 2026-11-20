/*
Adapted from EasyUI Not Found (https://easyui.site/components/not-found).

MIT License

Copyright (c) 2026 Suraj Maurya

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

"use client";

import {
  motion,
  type MotionValue,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { type PointerEvent, type ReactNode, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import { Button, buttonVariants } from "./button";

export interface NotFoundProps {
  errorCode?: string;
  badgeLabel?: string;
  title?: string;
  description?: ReactNode;
  actionLabel?: string;
  homeHref?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  secondaryHref?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

const FOLDER =
  "M12 0H64Q72 0 78 6L90 20Q94 26 102 26H276Q288 26 288 38V130Q288 142 276 142H12Q0 142 0 130V12Q0 0 12 0Z";
const REST = { x: -2, y: 0.5 };
const GLYPH_SPRING = { duration: 0.5, bounce: 0.2 };

function ErrorGlyph({
  glyph,
  index,
  count,
  pointer,
}: {
  glyph: string;
  index: number;
  count: number;
  pointer: MotionValue<{ x: number; y: number }>;
}) {
  const distanceX = useTransform(() => index + 0.5 - pointer.get().x * count);
  const lift = useTransform(() =>
    Math.max(
      0,
      1 - Math.hypot(distanceX.get(), (pointer.get().y - 0.5) * 1.5) / 1.25
    )
  );
  const x = useSpring(
    useTransform(() => distanceX.get() * lift.get() * 16),
    GLYPH_SPRING
  );
  const y = useSpring(
    useTransform(() => -lift.get() * 14),
    GLYPH_SPRING
  );

  return (
    <motion.span
      className="inline-block motion-reduce:transform-none!"
      style={{ x, y }}
    >
      {glyph}
    </motion.span>
  );
}

function Illustration({ code }: { code: string }) {
  const pointer = useMotionValue(REST);
  const glyphRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const glyphs = Array.from(code);

  function moveGlyphs(event: PointerEvent<HTMLDivElement>) {
    if (reducedMotion || event.pointerType !== "mouse") {
      return;
    }
    const bounds = glyphRef.current?.getBoundingClientRect();
    if (bounds?.width && bounds.height) {
      pointer.set({
        x: (event.clientX - bounds.left) / bounds.width,
        y: (event.clientY - bounds.top) / bounds.height,
      });
    }
  }

  return (
    <div
      aria-hidden
      className="relative isolate mx-auto grid aspect-[18/11] w-full max-w-88 place-items-center"
      data-slot="error-illustration"
      onPointerLeave={() => pointer.set(REST)}
      onPointerMove={moveGlyphs}
    >
      <svg
        className="pointer-events-none absolute inset-0 -z-10 size-full"
        viewBox="0 0 360 220"
      >
        <path
          className="fill-card stroke-border"
          d={FOLDER}
          strokeWidth="1.5"
          transform="translate(36 41) rotate(-8 144 71)"
        />
        <path
          className="fill-secondary stroke-border"
          d={FOLDER}
          strokeWidth="1.5"
          transform="translate(36 48) rotate(6 144 71)"
        />
      </svg>
      <div
        className="flex w-max font-mono font-semibold text-[clamp(4rem,17vw,8rem)] text-primary leading-none tracking-[-0.08em]"
        ref={glyphRef}
      >
        {glyphs.map((glyph, index) => (
          <ErrorGlyph
            count={glyphs.length}
            glyph={glyph}
            index={index}
            key={`${code}-${index}`}
            pointer={pointer}
          />
        ))}
      </div>
    </div>
  );
}

export function NotFound({
  errorCode = "404",
  badgeLabel,
  title = "Page not found",
  description = "This page may have moved or been removed.",
  actionLabel = "Back to home",
  homeHref = "/",
  onAction,
  secondaryActionLabel,
  secondaryHref,
  onSecondaryAction,
  className,
}: NotFoundProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <main
      className={cn(
        "mx-auto flex min-h-[65svh] w-full max-w-xl flex-col items-center justify-center gap-4 px-6 py-12 text-center text-foreground",
        className
      )}
    >
      <Illustration code={errorCode} />
      <p
        className={
          badgeLabel ? "font-mono text-muted-foreground text-xs" : "sr-only"
        }
      >
        {badgeLabel ?? errorCode}
      </p>
      <h1
        className="font-semibold text-3xl tracking-tight outline-none sm:text-4xl"
        ref={headingRef}
        tabIndex={-1}
      >
        {title}
      </h1>
      {description ? (
        <p className="max-w-sm text-pretty text-muted-foreground leading-relaxed">
          {description}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        {onAction ? (
          <Button onClick={onAction} size="lg" type="button">
            {actionLabel}
          </Button>
        ) : (
          <a className={buttonVariants({ size: "lg" })} href={homeHref}>
            {actionLabel}
          </a>
        )}
        {secondaryActionLabel && onSecondaryAction ? (
          <Button
            onClick={onSecondaryAction}
            size="lg"
            type="button"
            variant="outline"
          >
            {secondaryActionLabel}
          </Button>
        ) : null}
        {secondaryActionLabel && secondaryHref && !onSecondaryAction ? (
          <a
            className={buttonVariants({ size: "lg", variant: "outline" })}
            href={secondaryHref}
          >
            {secondaryActionLabel}
          </a>
        ) : null}
      </div>
    </main>
  );
}

export default NotFound;
