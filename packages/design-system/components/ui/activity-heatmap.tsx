/*
Adapted from EasyUI Activity Heatmap (https://easyui.site/components/activity-heatmap).

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
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Tooltip,
  clamp,
  fullFmt,
  useDismissOutside,
  useElementWidth,
} from "../../lib/chart-primitives";
import { cn } from "../../lib/utils";

export interface HeatDay {
  /** "YYYY-MM-DD" or a Date */
  date: string | Date;
  value: number;
}

export interface ActivityHeatmapProps {
  /** calendar: one cell per day (GitHub style) · hours: weekday × hour grid */
  mode?: "calendar" | "hours";
  /** calendar mode */
  data?: HeatDay[];
  /** hours mode: 7 rows × 24 columns */
  matrix?: number[][];
  /** hours mode row names (default Mon…Sun) */
  rowLabels?: string[];
  /** Most weeks to show. Narrow screens automatically show fewer (default 53) */
  weeks?: number;
  /** Last day shown (default: latest date in data) */
  endDate?: string | Date;
  /** 0 = Sunday, 1 = Monday */
  weekStart?: 0 | 1;
  color?: string;
  /** Plural noun used in the tooltip / summary */
  unit?: string;
  /** Smallest cell size in px before weeks are dropped (default 11) */
  minCell?: number;
  animated?: boolean;
  ariaLabel?: string;
  className?: string;
}

const DAY_MS = 86_400_000;
const toDay = (d: string | Date): number | null => {
  if (d instanceof Date)
    return isNaN(+d)
      ? null
      : Math.floor(
          Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS,
        );
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  if (m) return Math.floor(Date.UTC(+m[1], +m[2] - 1, +m[3]) / DAY_MS);
  const p = new Date(d);
  return isNaN(+p) ? null : toDay(p);
};
const weekday = (day: number) => (((day + 4) % 7) + 7) % 7; // 0 = Sunday
const dayFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const monthFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DEFAULT_ROW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const EMPTY_DAYS: HeatDay[] = [];
const LEVEL_MIX = [0, 28, 52, 76, 100];
const CELL_STYLES = `
  @keyframes activity-heatmap-enter {
    from { opacity: 0; transform: scale(.4); }
    to { opacity: 1; transform: scale(1); }
  }
  @media (prefers-reduced-motion: no-preference) {
    .activity-heatmap-cell {
      transform-box: fill-box;
      transform-origin: center;
      animation: activity-heatmap-enter .55s cubic-bezier(.23, 1, .32, 1) both;
      animation-delay: var(--heatmap-delay, 0s);
    }
  }
`;

interface HeatCell {
  c: number;
  r: number;
  v: number;
  title: string;
}

export function ActivityHeatmap({
  mode = "calendar",
  data = EMPTY_DAYS,
  matrix,
  rowLabels = DEFAULT_ROW_LABELS,
  weeks = 53,
  endDate,
  weekStart = 0,
  color = "#34d399",
  unit = "contributions",
  minCell = 11,
  animated = true,
  ariaLabel,
  className = "",
}: ActivityHeatmapProps) {
  const reduce = useReducedMotion();
  const anim = animated && !reduce;
  const [rootRef, width] = useElementWidth<HTMLDivElement>(720);
  const [active, setActive] = useState<{ c: number; r: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  useDismissOutside(
    wrapRef,
    active !== null,
    useCallback(() => setActive(null), []),
  );

  const hours = mode === "hours";
  const narrow = width < 440;
  const LW = hours ? (narrow ? 30 : 36) : narrow ? 18 : 30;
  const TOP = 18;
  const gap = hours ? (narrow ? 2 : 3) : 3;
  const innerW = Math.max(40, width - LW);

  // columns that fit
  const cols = hours
    ? 24
    : clamp(
        Math.floor((innerW + gap) / (minCell + gap)),
        1,
        Math.max(1, Math.floor(weeks)),
      );
  const cw = (innerW - (cols - 1) * gap) / cols;
  const cell = hours ? cw : Math.min(cw, 16);
  const ch = hours ? clamp(cw, 10, 22) : cell;
  const cwEff = hours ? cw : cell;

  // build cells
  const model = useMemo(() => {
    const out: HeatCell[] = [];
    let first = 0;
    if (hours) {
      const m = matrix ?? [];
      for (let r = 0; r < 7; r++)
        for (let c = 0; c < 24; c++) {
          const v = Math.max(0, Number(m[r]?.[c]) || 0);
          out.push({
            c,
            r,
            v,
            title: `${rowLabels[r] ?? ""} · ${String(c).padStart(2, "0")}:00`,
          });
        }
    } else {
      const map = new Map<number, number>();
      let maxDay = -Infinity;
      for (const d of data) {
        const day = toDay(d.date);
        if (day === null) continue;
        map.set(
          day,
          (map.get(day) ?? 0) +
            (Number.isFinite(d.value) ? Math.max(0, d.value) : 0),
        );
        maxDay = Math.max(maxDay, day);
      }
      const endDay =
        (endDate ? toDay(endDate) : null) ??
        (isFinite(maxDay) ? maxDay : (toDay(new Date()) as number));
      const lastColStart = endDay - ((weekday(endDay) - weekStart + 7) % 7);
      first = lastColStart - (cols - 1) * 7;
      for (let c = 0; c < cols; c++)
        for (let r = 0; r < 7; r++) {
          const day = first + c * 7 + r;
          if (day > endDay) continue;
          out.push({
            c,
            r,
            v: map.get(day) ?? 0,
            title: dayFmt.format(new Date(day * DAY_MS)),
          });
        }
    }
    const nz = out
      .filter((x) => x.v > 0)
      .map((x) => x.v)
      .sort((a, b) => a - b);
    const q = (p: number) =>
      nz[Math.min(nz.length - 1, Math.floor(p * nz.length))] ?? 0;
    const t1 = q(0.25),
      t2 = q(0.5),
      t3 = q(0.75);
    const level = (v: number) =>
      v <= 0 ? 0 : v <= t1 ? 1 : v <= t2 ? 2 : v <= t3 ? 3 : 4;
    const total = out.reduce((s, x) => s + x.v, 0);
    const best = out.reduce<HeatCell | null>(
      (b, x) => (!b || x.v > b.v ? x : b),
      null,
    );
    return { cells: out, level, total, best, first };
  }, [hours, matrix, rowLabels, data, endDate, weekStart, cols]);

  const byKey = useMemo(
    () => new Map(model.cells.map((x) => [`${x.c}:${x.r}`, x])),
    [model.cells],
  );
  const gx = (c: number) => LW + c * (cwEff + gap);
  const gy = (r: number) => TOP + r * (ch + gap);
  const svgH = TOP + 7 * ch + 6 * gap + 2;

  // month / hour labels
  const topLabels = useMemo(() => {
    const out: { c: number; text: string }[] = [];
    if (hours) {
      const every = cwEff < 14 ? 6 : 3;
      for (let c = 0; c < 24; c += every) out.push({ c, text: String(c) });
    } else {
      let prev = -1;
      let lastC = -9;
      for (let c = 0; c < cols; c++) {
        const m = new Date((model.first + c * 7) * DAY_MS).getUTCMonth();
        if (m !== prev) {
          if (prev !== -1 && c - lastC >= 3 && c <= cols - 2) {
            out.push({
              c,
              text: monthFmt.format(new Date((model.first + c * 7) * DAY_MS)),
            });
            lastC = c;
          } else if (prev === -1 && cols > 6) {
            out.push({
              c,
              text: monthFmt.format(new Date((model.first + c * 7) * DAY_MS)),
            });
            lastC = c;
          }
          prev = m;
        }
      }
    }
    return out;
  }, [hours, cols, cwEff, model.first]);

  const rowNames = hours
    ? rowLabels
        .map((l, r) => ({ r, text: narrow ? l.slice(0, 1) : l }))
        .filter((x) => !narrow || x.r % 2 === 0)
    : [1, 3, 5].map((k) => {
        const r = (k - weekStart + 7) % 7;
        return { r, text: narrow ? WEEKDAYS[k].slice(0, 1) : WEEKDAYS[k] };
      });

  const locate = (e: ReactPointerEvent<SVGRectElement>) => {
    // SVG coordinates account for scaled and rotated containers.
    const transform = e.currentTarget.ownerSVGElement?.getScreenCTM();
    if (!transform) return;
    const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(
      transform.inverse(),
    );
    const c = Math.floor((point.x - LW) / (cwEff + gap));
    const r = Math.floor((point.y - TOP) / (ch + gap));
    if (c < 0 || r < 0 || c >= cols || r > 6 || !byKey.has(`${c}:${r}`))
      return setActive(null);
    setActive((current) =>
      current?.c === c && current.r === r ? current : { c, r },
    );
  };
  const onKey = (e: ReactKeyboardEvent) => {
    const dc = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    const dr = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
    if (e.key === "Escape") return setActive(null);
    if (!dc && !dr) return;
    e.preventDefault();
    setActive((a) => {
      const from = a ?? { c: cols - 1, r: 0 };
      const next = {
        c: clamp(from.c + dc, 0, cols - 1),
        r: clamp(from.r + dr, 0, 6),
      };
      return byKey.has(`${next.c}:${next.r}`) ? next : from;
    });
  };

  const cur = active ? byKey.get(`${active.c}:${active.r}`) : null;
  const total = model.total;
  const summary = hours
    ? `${fullFmt.format(total)} ${unit} per week`
    : `${fullFmt.format(total)} ${unit} in the last ${cols >= 52 ? "year" : cols >= 8 ? `${Math.round(cols / 4.345)} months` : `${cols} weeks`}`;
  const lvlFill = (l: number): CSSProperties =>
    l === 0
      ? {}
      : { fill: `color-mix(in srgb, ${color} ${LEVEL_MIX[l]}%, transparent)` };

  return (
    <div ref={rootRef} className={cn("w-full", className)}>
      {animated ? <style>{CELL_STYLES}</style> : null}

      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-[13px] font-medium tabular-nums text-foreground">
          {summary}
        </p>
        {model.best && model.best.v > 0 && (
          <p className="text-muted-foreground text-xs">
            Peak {model.best.title} ·{" "}
            <span className="tabular-nums">{fullFmt.format(model.best.v)}</span>
          </p>
        )}
      </div>

      <div ref={wrapRef} className="relative" style={{ height: svgH }}>
        <svg
          height={svgH}
          viewBox={`0 0 ${width} ${svgH}`}
          role="img"
          aria-label={ariaLabel ?? `Activity heatmap. ${summary}`}
          tabIndex={0}
          onKeyDown={onKey}
          onBlur={() => setActive(null)}
          className="block w-full touch-pan-y overflow-visible rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {topLabels.map((l) => (
            <text
              key={l.c}
              x={gx(l.c)}
              y={11}
              className="fill-muted-foreground text-[11px]"
            >
              {l.text}
            </text>
          ))}
          {rowNames.map((l) => (
            <text
              key={l.r}
              x={0}
              y={gy(l.r) + ch / 2}
              dominantBaseline="middle"
              className="fill-muted-foreground text-[10.5px]"
            >
              {l.text}
            </text>
          ))}

          {/* crosshair bands (hours mode) */}
          {hours && (
            <>
              <motion.rect
                x={LW - 2}
                width={24 * (cwEff + gap)}
                height={ch + 4}
                rx={5}
                className="fill-foreground/[0.05]"
                initial={false}
                animate={{ y: gy(cur?.r ?? 0) - 2, opacity: cur ? 1 : 0 }}
                transition={!anim ? { duration: 0 } : { duration: 0.15 }}
              />
              <motion.rect
                y={TOP - 2}
                width={cwEff + 4}
                height={7 * ch + 6 * gap}
                rx={5}
                className="fill-foreground/[0.05]"
                initial={false}
                animate={{ x: gx(cur?.c ?? 0) - 2, opacity: cur ? 1 : 0 }}
                transition={!anim ? { duration: 0 } : { duration: 0.15 }}
              />
            </>
          )}

          {model.cells.map((x) => {
            const level = model.level(x.v);
            return (
              <rect
                key={`${x.c}:${x.r}`}
                x={gx(x.c)}
                y={gy(x.r)}
                width={cwEff}
                height={ch}
                rx={Math.min(3, cwEff / 4)}
                className={cn(
                  anim && "activity-heatmap-cell",
                  level === 0 && "fill-muted",
                )}
                data-level={level}
                style={
                  {
                    ...lvlFill(level),
                    "--heatmap-delay": anim
                      ? `${(x.c * 0.012 + x.r * 0.02).toFixed(3)}s`
                      : undefined,
                  } as CSSProperties
                }
              />
            );
          })}

          {/* active ring */}
          <motion.rect
            width={cwEff + 2}
            height={ch + 2}
            rx={Math.min(4, cwEff / 3)}
            fill="none"
            strokeWidth={1.5}
            className="stroke-foreground"
            initial={false}
            animate={{
              x: gx(cur?.c ?? 0) - 1,
              y: gy(cur?.r ?? 0) - 1,
              opacity: cur ? 1 : 0,
            }}
            transition={
              !anim
                ? { duration: 0 }
                : {
                    x: { duration: 0.12 },
                    y: { duration: 0.12 },
                    opacity: { duration: 0.12 },
                  }
            }
          />

          <rect
            x={LW}
            y={TOP}
            width={cols * cwEff + (cols - 1) * gap}
            height={7 * ch + 6 * gap}
            fill="transparent"
            onPointerMove={locate}
            onPointerDown={locate}
            onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
          />
        </svg>

        <Tooltip
          pos={cur ? { x: gx(cur.c) + cwEff / 2, y: gy(cur.r) } : null}
          boundsWidth={width}
        >
          {cur && (
            <>
              <p className="font-medium tabular-nums text-foreground">
                {fullFmt.format(cur.v)}{" "}
                <span className="font-normal text-muted-foreground">
                  {unit}
                </span>
              </p>
              <p className="mt-0.5 text-muted-foreground">{cur.title}</p>
            </>
          )}
        </Tooltip>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {cur ? `${cur.title}: ${fullFmt.format(cur.v)} ${unit}` : ""}
      </p>

      <div className="mt-3 flex items-center justify-end gap-2 text-[11.5px] text-muted-foreground">
        Less
        <span className="flex gap-[3px]" aria-hidden>
          {LEVEL_MIX.map((m) => (
            <span
              key={m}
              className={cn("size-[11px] rounded-[3px]", m === 0 && "bg-muted")}
              style={
                m === 0
                  ? undefined
                  : {
                      background: `color-mix(in srgb, ${color} ${m}%, transparent)`,
                    }
              }
            />
          ))}
        </span>
        More
      </div>
    </div>
  );
}
