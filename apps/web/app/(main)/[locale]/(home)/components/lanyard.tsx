"use client";

import { useTheme } from "@repo/design-system/client";
import { useEffect, useRef } from "react";
import styles from "./lanyard.module.css";
import type { LanyardDictionary } from "./lanyard-content";
import {
  LANYARD_PREVIEW_SIZES,
  type LanyardPreview,
  type LanyardPreviewImages,
} from "./lanyard-preview";
import type {
  LanyardCommand,
  LanyardConfiguration,
  LanyardEvent,
  LanyardPointer,
  LanyardSize,
} from "./lanyard-renderer";

interface LanyardProps {
  avatarUrl?: string;
  dictionary: LanyardDictionary;
  fov?: number;
  preview?: LanyardPreview;
}

function PreviewPicture({
  desktop,
  mobile,
  pose,
}: {
  desktop: LanyardPreviewImages;
  mobile: LanyardPreviewImages;
  pose: keyof LanyardPreviewImages;
}) {
  return (
    <picture className={pose === "entrance" ? styles.entrance : styles.rest}>
      <source
        height={LANYARD_PREVIEW_SIZES.desktop.height}
        media="(min-width: 768px)"
        srcSet={`${desktop[pose].src} 1x, ${desktop[pose].src2x} 2x`}
        width={LANYARD_PREVIEW_SIZES.desktop.width}
      />
      {/* These are responsive, lossless build artifacts. Avoid a second
          image optimizer request and let CSS select the theme before hydration. */}
      <img
        alt=""
        draggable={false}
        fetchPriority="high"
        height={Math.round(LANYARD_PREVIEW_SIZES.mobile.height)}
        loading="lazy"
        src={mobile[pose].src}
        srcSet={`${mobile[pose].src} 1x, ${mobile[pose].src2x} 2x`}
        width={LANYARD_PREVIEW_SIZES.mobile.width}
      />
    </picture>
  );
}

export function Lanyard({
  dictionary,
  avatarUrl,
  fov = 20,
  preview,
}: LanyardProps) {
  const { resolvedTheme, theme } = useTheme();
  const configuration = useRef<LanyardConfiguration>({
    dictionary,
    avatarUrl,
    fov,
    isDark: false,
    reducedMotion: false,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const configureRef = useRef<(() => void) | null>(null);
  const runtimeRef = useRef<{
    resume: () => void;
    suspend: () => void;
  } | null>(null);

  useEffect(() => {
    configuration.current = {
      ...configuration.current,
      dictionary,
      avatarUrl,
      fov,
      isDark: (resolvedTheme ?? theme) === "dark",
    };
    configureRef.current?.();
  }, [dictionary, avatarUrl, fov, resolvedTheme, theme]);

  useEffect(() => {
    // Activity recreates effects on return, but retains the canvas and worker.
    if (runtimeRef.current) {
      runtimeRef.current.resume();
      return runtimeRef.current.suspend;
    }
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const overlay = container.querySelector<HTMLElement>("[data-preview]");
    const canvas = document.createElement("canvas");
    canvas.className = styles.canvas;
    canvas.setAttribute("aria-hidden", "true");
    container.appendChild(canvas);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    configuration.current.reducedMotion = motion.matches;
    configuration.current.isDark =
      document.documentElement.classList.contains("dark");
    container.dataset.state = "loading";
    // Activity restores the same DOM after cleaning up and recreating effects.
    overlay?.style.removeProperty("display");
    overlay?.style.removeProperty("opacity");
    let alive = true;
    let interactive = false;
    let visible = false;
    let failed = false;
    let worker: Worker | null = null;
    let revision = 0;
    let readyRevision = -1;
    let handoffRevision = -1;
    let frame = 0;
    let startupFrame = 0;
    let startupIdle: number | undefined;
    let animation: Animation | null = null;
    let deadline: ReturnType<typeof setTimeout> | undefined;
    let lastConfiguration = "";
    let suspended = false;
    let removalObserver: MutationObserver | null = null;

    const size = (): LanyardSize => {
      // The mobile hero scales its 250x360 wrapper by 1.38. Keep these
      // transformed bounds for the camera and for crisp physical pixels.
      const bounds = container.getBoundingClientRect();
      return {
        width: Math.max(1, bounds.width),
        height: Math.max(1, bounds.height),
        pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      };
    };
    const cancelHandoff = () => {
      cancelAnimationFrame(frame);
      animation?.cancel();
      animation = null;
      handoffRevision = -1;
      if (!interactive) {
        canvas.style.opacity = "0";
        if (overlay) {
          overlay.style.opacity = "1";
        }
      }
    };
    const keepStatic = () => {
      if (!alive || failed) {
        return;
      }
      failed = true;
      interactive = false;
      cancelHandoff();
      clearTimeout(deadline);
      worker?.terminate();
      worker = null;
      canvas.remove();
      container.dataset.state = "static";
      if (overlay) {
        overlay.style.opacity = "1";
        overlay.style.display = "";
      }
    };
    const armDeadline = (pendingRevision: number) => {
      clearTimeout(deadline);
      deadline = setTimeout(() => {
        if (
          !interactive &&
          revision === pendingRevision &&
          readyRevision !== pendingRevision
        ) {
          keepStatic();
        }
      }, 10_000);
    };
    const send = (command: LanyardCommand) => {
      try {
        worker?.postMessage(command);
      } catch {
        keepStatic();
      }
    };
    const handoff = () => {
      if (
        !alive ||
        failed ||
        interactive ||
        !visible ||
        document.hidden ||
        readyRevision !== revision ||
        handoffRevision === revision
      ) {
        return;
      }
      handoffRevision = revision;
      const current = revision;
      const finish = () => {
        if (
          !alive ||
          failed ||
          current !== revision ||
          !visible ||
          document.hidden
        ) {
          return;
        }
        animation?.cancel();
        animation = null;
        send({ type: "reveal", revision });
        if (failed) {
          return;
        }
        interactive = true;
        canvas.dataset.ready = "true";
        container.dataset.state = "live";
      };
      // A worker message can precede OffscreenCanvas compositing. Leave the
      // snapshot in place for two browser frames before exposing the canvas.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          if (!alive || failed || current !== revision) {
            return;
          }
          canvas.style.opacity = "1";
          const target = overlay ?? canvas;
          animation = target.animate(
            { opacity: overlay ? [1, 0] : [0, 1] },
            {
              duration: 150,
              easing: "cubic-bezier(0.23, 1, 0.32, 1)",
              fill: "forwards",
            }
          );
          animation.finished.then(finish).catch(() => undefined);
        });
      });
    };
    const configure = () => {
      if (suspended) {
        return;
      }
      const measured = size();
      const key = JSON.stringify([configuration.current, measured]);
      if (failed || key === lastConfiguration) {
        return;
      }
      lastConfiguration = key;
      revision++;
      if (!interactive) {
        cancelHandoff();
        canvas.removeAttribute("data-frame-ready");
        if (worker) {
          armDeadline(revision);
        }
      }
      send({
        type: "configure",
        configuration: configuration.current,
        size: measured,
        revision,
      });
    };
    const visibility = () => {
      send({ type: "visibility", visible: visible && !document.hidden });
      if (!visible || document.hidden) {
        cancelHandoff();
      } else {
        handoff();
      }
    };
    const pointer = (event: PointerEvent) => {
      if (!interactive || failed) {
        return;
      }
      const bounds = canvas.getBoundingClientRect();
      const data: LanyardPointer = {
        type: event.type as LanyardPointer["type"],
        x: ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        y: -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
        clientX: event.clientX,
        clientY: event.clientY,
        button: event.button,
        isPrimary: event.isPrimary,
        pointerId: event.pointerId,
        pointerType: event.pointerType,
        time: performance.now(),
      };
      send({ type: "pointer", pointer: data });
    };

    const onWorkerMessage = ({ data }: MessageEvent<LanyardEvent>) => {
      if (!alive || failed) {
        return;
      }
      if (data.type === "error") {
        keepStatic();
      } else if (data.type === "ready" && data.revision === revision) {
        clearTimeout(deadline);
        readyRevision = data.revision;
        canvas.dataset.frameReady = "true";
        handoff();
      } else if (data.type === "cursor" && interactive) {
        canvas.style.cursor = data.value;
      }
    };

    const startWorker = () => {
      if (!alive || failed) {
        return;
      }
      if (
        typeof Worker === "function" &&
        "transferControlToOffscreen" in canvas
      ) {
        try {
          worker = new Worker(new URL("./lanyard.worker.ts", import.meta.url), {
            type: "module",
          });
          worker.onmessage = onWorkerMessage;
          worker.onerror = (event) => {
            event.preventDefault();
            keepStatic();
          };
          const offscreen = canvas.transferControlToOffscreen();
          const measured = size();
          lastConfiguration = JSON.stringify([configuration.current, measured]);
          worker.postMessage(
            {
              type: "init",
              canvas: offscreen,
              configuration: configuration.current,
              size: measured,
              revision,
            } satisfies LanyardCommand,
            [offscreen]
          );
          armDeadline(revision);
        } catch {
          keepStatic();
        }
      } else {
        keepStatic();
      }

      send({ type: "visibility", visible: visible && !document.hidden });
    };
    const resizeObserver = new ResizeObserver(configure);
    const intersection = new IntersectionObserver(([entry]) => {
      if (suspended) {
        return;
      }
      visible = entry.isIntersecting;
      visibility();
    });
    const pointerEvents = [
      "pointerdown",
      "pointermove",
      "pointerup",
      "pointercancel",
      "pointerleave",
    ] as const;
    const onMotionChange = () => {
      configuration.current.reducedMotion = motion.matches;
      configure();
    };
    const resume = () => {
      suspended = false;
      removalObserver?.disconnect();
      removalObserver = null;
      configuration.current.reducedMotion = motion.matches;
      configureRef.current = configure;
      resizeObserver.observe(container);
      intersection.observe(container);
      window.addEventListener("resize", configure);
      document.addEventListener("visibilitychange", visibility);
      motion.addEventListener("change", onMotionChange);
      for (const type of pointerEvents) {
        container.addEventListener(type, pointer);
      }
      configure();
    };

    // Let the hero's initial DOM/layout paint before optional graphics setup.
    // Idle work normally starts on the next frame; cap deferral on busy pages.
    if (typeof window.requestIdleCallback === "function") {
      startupIdle = window.requestIdleCallback(startWorker, { timeout: 200 });
    } else {
      startupFrame = requestAnimationFrame(() => {
        startupFrame = requestAnimationFrame(startWorker);
      });
    }

    const dispose = () => {
      if (!alive) {
        return;
      }
      alive = false;
      if (startupIdle !== undefined) {
        window.cancelIdleCallback(startupIdle);
      }
      cancelAnimationFrame(startupFrame);
      cancelHandoff();
      clearTimeout(deadline);
      configureRef.current = null;
      worker?.terminate();
      removalObserver?.disconnect();
      runtimeRef.current = null;
      canvas.remove();
    };
    const suspend = () => {
      suspended = true;
      visible = false;
      visibility();
      configureRef.current = null;
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("resize", configure);
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", onMotionChange);
      for (const type of pointerEvents) {
        container.removeEventListener(type, pointer);
      }
      // Hidden Activity trees stay connected. Real unmounts and later cache
      // eviction remove their DOM, at which point GPU/worker resources must go.
      const releaseIfRemoved = () => {
        if (suspended && !container.isConnected) {
          dispose();
        }
      };
      removalObserver = new MutationObserver(releaseIfRemoved);
      removalObserver.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
      queueMicrotask(releaseIfRemoved);
    };
    runtimeRef.current = { resume, suspend };
    resume();
    return suspend;
  }, []);

  return (
    <div
      className={`lanyard-wrapper ${styles.wrapper}`}
      ref={containerRef}
      style={{ width: "100%", height: "100dvh", overflow: "hidden" }}
    >
      {preview ? (
        <div aria-hidden="true" className={styles.preview} data-preview="">
          <div className={styles.light}>
            <PreviewPicture
              desktop={preview.desktop.light}
              mobile={preview.mobile.light}
              pose="entrance"
            />
            <PreviewPicture
              desktop={preview.desktop.light}
              mobile={preview.mobile.light}
              pose="rest"
            />
          </div>
          <div className={styles.dark}>
            <PreviewPicture
              desktop={preview.desktop.dark}
              mobile={preview.mobile.dark}
              pose="entrance"
            />
            <PreviewPicture
              desktop={preview.desktop.dark}
              mobile={preview.mobile.dark}
              pose="rest"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
