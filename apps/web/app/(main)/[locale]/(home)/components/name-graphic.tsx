"use client";

import { cn } from "@repo/design-system/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import styles from "./name-graphic.module.css";

// Paths and bounds come from the CMS; this component only renders the animation.

interface NameGraphicProps {
  /** Additional CSS classes */
  className?: string;
  /** Color of the signature */
  color?: string;
  /** Delay before the animation starts, in seconds */
  delay?: number;
  /** Draw duration per stroke, in seconds */
  duration?: number;
  /** Only animate when scrolled into view */
  inView?: boolean;
  label: string;
  /** Thickness of the visible tracing line under the reveal, in SVG user units */
  lineThickness?: number;
  /** Only play the animation once */
  once?: boolean;
  paths: readonly string[];
  /**
   * Thickness of the ink-reveal mask stroke, in SVG user units (viewBox space).
   * This should roughly match the actual pen-stroke width of your traced
   * signature — tune it up/down until the reveal doesn't clip the fill.
   */
  revealThickness?: number;
  /** Stagger between the two strokes, in seconds */
  staggerDelay?: number;
  viewBox: string;
}

export function NameGraphic({
  paths,
  viewBox,
  label,
  color = "currentColor",
  duration = 1.5,
  delay = 0,
  staggerDelay = 0.3,
  revealThickness = 14,
  lineThickness = 2,
  className,
  inView = false,
  once = true,
}: NameGraphicProps) {
  const maskId = `name-graphic-reveal-${useId().replace(/:/g, "")}`;
  const reducedMotion = useReducedMotion();

  const variants = {
    hidden: {
      pathLength: reducedMotion ? 1 : 0,
      opacity: reducedMotion ? 1 : 0,
    },
    visible: { pathLength: 1, opacity: 1 },
  };

  return (
    <motion.svg
      animate={inView ? undefined : "visible"}
      aria-label={label}
      className={cn(
        styles.signature,
        "overflow-visible text-foreground",
        className
      )}
      id="canvas"
      initial={reducedMotion ? false : "hidden"}
      role="img"
      stroke="currentColor"
      strokeLinejoin="round"
      viewBox={viewBox}
      viewport={{ once }}
      whileInView={inView ? "visible" : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{label}</title>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse">
          {paths.map((d, i) => (
            <motion.path
              d={d}
              fill="none"
              // biome-ignore lint/suspicious/noArrayIndexKey: This is a static array of paths, so the index is safe to use as a key.
              key={i}
              stroke="white"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={revealThickness}
              transition={{
                pathLength: {
                  delay: reducedMotion ? 0 : delay + i * staggerDelay,
                  duration: reducedMotion ? 0 : duration,
                  ease: "easeInOut",
                },
                opacity: {
                  delay: reducedMotion ? 0 : delay + i * staggerDelay + 0.01,
                  duration: reducedMotion ? 0 : 0.01,
                },
              }}
              variants={variants}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </mask>
      </defs>

      {paths.map((d, i) => (
        <motion.path
          d={d}
          fill="none"
          // biome-ignore lint/suspicious/noArrayIndexKey: This is a static array of paths, so the index is safe to use as a key.
          key={i}
          stroke={color}
          strokeLinecap="butt"
          strokeLinejoin="round"
          strokeWidth={lineThickness}
          transition={{
            pathLength: {
              delay: reducedMotion ? 0 : delay + i * staggerDelay,
              duration: reducedMotion ? 0 : duration,
              ease: "easeInOut",
            },
            opacity: {
              delay: reducedMotion ? 0 : delay + i * staggerDelay + 0.01,
              duration: reducedMotion ? 0 : 0.01,
            },
          }}
          variants={variants}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      <g mask={`url(#${maskId})`}>
        {paths.map((d, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: This is a static array of paths, so the index is safe to use as a key.
          <path d={d} fill={color} key={i} />
        ))}
      </g>
    </motion.svg>
  );
}
