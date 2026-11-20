"use client";

import { cn } from "@repo/design-system/lib/utils";
import { useTranslations } from "@repo/internationalization/client";
import {
  useCallback,
  useEffect,
  useId,
  useReducer,
  useRef,
  useState,
} from "react";
import styles from "./music-player-widget.module.css";

/* ----------------------------------------------------------------- types */

export interface Track {
  artist: string;
  cover: string;
  coverSrcSet?: string;
  src: string;
  title: string;
}
export type LoopMode = "off" | "all" | "one";
export type Direction = "next" | "prev" | null;
type AudioCtor = typeof AudioContext;
type FrequencyData = Uint8Array<ArrayBuffer>;

const noop = (): void => undefined;

/* ------------------------------------------------------------- useRafLoop */

function useRafLoop(cb: (now: number, dt: number) => void, enabled = true) {
  const cbRef = useRef(cb);
  useEffect(() => {
    cbRef.current = cb;
  }, [cb]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      cbRef.current(now, dt);
      raf = requestAnimationFrame(loop);
    };
    const synchronize = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      // Render a static frame even when continuous animation is disabled.
      cbRef.current(last, 0);
      if (enabled && !motion.matches && !document.hidden) {
        raf = requestAnimationFrame(loop);
      }
    };
    synchronize();
    motion.addEventListener("change", synchronize);
    document.addEventListener("visibilitychange", synchronize);
    return () => {
      cancelAnimationFrame(raf);
      motion.removeEventListener("change", synchronize);
      document.removeEventListener("visibilitychange", synchronize);
    };
  }, [enabled]);
}

/* -------------------------------------------------- useTransitionSound */

function useTransitionSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  useEffect(
    () => () => {
      ctxRef.current?.close().catch(noop);
      ctxRef.current = null;
    },
    []
  );
  return useCallback((bassEnergy = 0.5) => {
    try {
      if (!ctxRef.current) {
        const Ctor: AudioCtor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: AudioCtor })
            .webkitAudioContext;
        if (!Ctor) {
          return;
        }
        ctxRef.current = new Ctor();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startFreq = 440 + bassEnergy * 440;
      const endFreq = startFreq * (2 / 3);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.09);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      /* Web Audio unavailable */
    }
  }, []);
}

/* --------------------------------------------------- useAudioAnalyser */

const FFT_SIZE = 256;

function useAudioAnalyser(audioRef: React.RefObject<HTMLAudioElement | null>) {
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<FrequencyData>(new Uint8Array(FFT_SIZE / 2));
  const connectedRef = useRef(false);

  const connect = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (connectedRef.current) {
      ctxRef.current?.resume().catch(noop);
      return;
    }
    try {
      const Ctor: AudioCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: AudioCtor })
          .webkitAudioContext;
      if (!Ctor) {
        return;
      }
      const ctx = new Ctor();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.8;
      const source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(ctx.destination);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
      dataRef.current = new Uint8Array(analyser.frequencyBinCount);
      connectedRef.current = true;
      if (ctx.state === "suspended") {
        ctx.resume().catch(noop);
      }
    } catch {
      /* unavailable or already connected */
    }
  }, [audioRef]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.addEventListener("play", connect, { once: true });
    return () => audio.removeEventListener("play", connect);
  }, [audioRef, connect]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio?.isConnected) {
        // Activity retains the same media element. Its Web Audio source can
        // only be created once, so keep that connection for the return visit.
        ctxRef.current?.suspend().catch(noop);
      } else {
        ctxRef.current?.close().catch(noop);
        ctxRef.current = null;
        connectedRef.current = false;
      }
    };
  }, [audioRef]);

  const getFrequencyData = useCallback((): FrequencyData | null => {
    const analyser = analyserRef.current;
    if (!analyser) {
      return null;
    }
    if (ctxRef.current?.state === "suspended") {
      ctxRef.current.resume().catch(noop);
    }
    analyser.getByteFrequencyData(dataRef.current);
    return dataRef.current;
  }, []);

  const getBandEnergy = useCallback(
    (startBin: number, endBin: number): number => {
      if (!analyserRef.current) {
        return 0;
      }
      const data = dataRef.current;
      const count = endBin - startBin;
      if (count <= 0) {
        return 0;
      }
      let sum = 0;
      for (let i = startBin; i < endBin && i < data.length; i++) {
        sum += data[i];
      }
      return sum / count / 255;
    },
    []
  );

  return { getFrequencyData, getBandEnergy };
}

/* ------------------------------------------------------ useAudioPlayer */

interface State {
  currentIndex: number;
  direction: Direction;
  isPlaying: boolean;
  loopMode: LoopMode;
  order: number[];
  shuffled: boolean;
}
type Action =
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "SET_TRACK"; index: number; direction: Direction }
  | { type: "TOGGLE_SHUFFLE"; trackCount: number }
  | { type: "CYCLE_LOOP" };

function shuffleOrder(pinFirst: number, count: number): number[] {
  const rest = Array.from({ length: count }, (_, i) => i).filter(
    (x) => x !== pinFirst
  );
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [pinFirst, ...rest];
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "PLAY":
      return { ...state, isPlaying: true };
    case "PAUSE":
      return { ...state, isPlaying: false };
    case "SET_TRACK":
      return {
        ...state,
        currentIndex: action.index,
        direction: action.direction,
      };
    case "TOGGLE_SHUFFLE": {
      const shuffled = !state.shuffled;
      const order = shuffled
        ? shuffleOrder(state.currentIndex, action.trackCount)
        : Array.from({ length: action.trackCount }, (_, i) => i);
      return { ...state, shuffled, order };
    }
    case "CYCLE_LOOP": {
      let next: LoopMode = "off";
      if (state.loopMode === "off") {
        next = "all";
      } else if (state.loopMode === "all") {
        next = "one";
      }
      return { ...state, loopMode: next };
    }
    default:
      return state;
  }
}

function useAudioPlayer(tracks: Track[]) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const initialSource = tracks[0].src;
  const initialized = useRef(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [state, dispatch] = useReducer(reducer, {
    currentIndex: 0,
    order: Array.from({ length: tracks.length }, (_, i) => i),
    shuffled: false,
    loopMode: "off",
    isPlaying: false,
    direction: null,
  });

  const { getFrequencyData, getBandEnergy } = useAudioAnalyser(audioRef);
  const playTransitionSound = useTransitionSound();

  const loadTrack = useCallback(
    (index: number, autoplay: boolean, direction: Direction) => {
      const audio = audioRef.current;
      if (!audio) {
        return;
      }
      const bassEnergy = getBandEnergy(0, 4);
      playTransitionSound(bassEnergy);
      dispatch({ type: "SET_TRACK", index, direction });
      audio.src = tracks[index].src;
      audio.load();
      if (autoplay) {
        audio.play().catch(noop);
      }
    },
    [tracks, playTransitionSound, getBandEnergy]
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (audio.paused) {
      audio.play().catch(noop);
    } else {
      audio.pause();
    }
  }, []);

  const next = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    const pos = state.order.indexOf(state.currentIndex);
    const np = pos + 1;
    if (np >= state.order.length) {
      if (state.loopMode === "all") {
        loadTrack(state.order[0], !audio.paused, "next");
      } else {
        audio.pause();
        audio.currentTime = 0;
      }
      return;
    }
    loadTrack(state.order[np], !audio.paused, "next");
  }, [state.order, state.currentIndex, state.loopMode, loadTrack]);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const pos = state.order.indexOf(state.currentIndex);
    const pp = pos - 1;
    if (pp < 0) {
      if (state.loopMode === "all") {
        loadTrack(state.order.at(-1) ?? 0, !audio.paused, "prev");
      } else {
        audio.currentTime = 0;
      }
      return;
    }
    loadTrack(state.order[pp], !audio.paused, "prev");
  }, [state.order, state.currentIndex, state.loopMode, loadTrack]);

  const seek = useCallback((pct: number) => {
    const audio = audioRef.current;
    if (!audio?.duration) {
      return;
    }
    audio.currentTime = pct * audio.duration;
  }, []);

  const seekRelative = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.currentTime = Math.max(
      0,
      Math.min(audio.duration || 0, audio.currentTime + seconds)
    );
  }, []);

  const toggleShuffle = useCallback(() => {
    dispatch({ type: "TOGGLE_SHUFFLE", trackCount: tracks.length });
  }, [tracks.length]);

  const cycleLoop = useCallback(() => {
    dispatch({ type: "CYCLE_LOOP" });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    const onPlay = () => dispatch({ type: "PLAY" });
    const onPause = () => dispatch({ type: "PAUSE" });
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => {
      if (state.loopMode === "one") {
        audio.currentTime = 0;
        audio.play().catch(noop);
      } else {
        next();
      }
    };
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [state.loopMode, next]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (!initialized.current) {
      audio.src = initialSource;
      audio.load();
      initialized.current = true;
    }
    return () => audio.pause();
  }, [initialSource]);

  return {
    audioRef,
    state,
    currentTime,
    duration,
    currentTrack: tracks[state.currentIndex],
    toggle,
    next,
    prev,
    seek,
    seekRelative,
    toggleShuffle,
    cycleLoop,
    getFrequencyData,
  };
}

/* --------------------------------------------------------- ScalesMixer */

const COLS = 10;
const ROWS = 10;
const COL_RANGE = Array.from({ length: COLS }, (_, i) => i);
const ROW_RANGE = Array.from({ length: ROWS }, (_, i) => i);
const BAND_RANGES: [number, number][] = [
  [0, 1],
  [1, 3],
  [3, 6],
  [6, 10],
  [10, 16],
  [16, 24],
  [24, 36],
  [36, 52],
  [52, 74],
  [74, 100],
];
const sineOut = (x: number) => Math.sin((x * Math.PI) / 2);
const sineIn = (x: number) => 1 - Math.cos((x * Math.PI) / 2);
const sineInOut = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const PART_A_DUR = 1.5;
const PART_A_TO = 11;
const PART_A_STEP = 3 / (COLS - 1);
const PART_B_DUR = 1;
const SCALE_FROM = 0.133;
const SCALE_TO = 0.8;

function partAColumnY(time: number, col: number): number {
  const local = time - col * PART_A_STEP;
  const period = PART_A_DUR * 2;
  const cyc = ((local % period) + period) % period;
  if (cyc < PART_A_DUR) {
    return PART_A_TO * sineInOut(cyc / PART_A_DUR);
  }
  return PART_A_TO * sineInOut(1 - (cyc - PART_A_DUR) / PART_A_DUR);
}
function partBCircle(time: number, col: number, row: number): [number, number] {
  const frac = row / ROWS;
  const yFrom = lerp(77, -77, frac);
  const yTo = lerp(col, -col, frac);
  const local = time - col / COLS;
  const period = PART_B_DUR * 2;
  const cyc = ((local % period) + period) % period;
  let e: number;
  if (cyc < PART_B_DUR) {
    e = sineOut(cyc / PART_B_DUR);
  } else {
    e = sineIn(1 - (cyc - PART_B_DUR) / PART_B_DUR);
  }
  return [lerp(yFrom, yTo, e), lerp(SCALE_FROM, SCALE_TO, e)];
}

function ScalesMixer({
  isPlaying,
  getFrequencyData,
}: {
  isPlaying: boolean;
  getFrequencyData?: () => FrequencyData | null;
}) {
  const maskId = useId().replace(/:/g, "_");
  const colRefs = useRef<(SVGGElement | null)[]>([]);
  const circleRefs = useRef<(SVGCircleElement | null)[][]>(
    Array.from({ length: COLS }, () => [])
  );
  const tRef = useRef(50);

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: render loop drives a fixed-size grid animation; complexity is inherent
  useRafLoop((_, dt) => {
    if (isPlaying) {
      tRef.current += dt / 1000;
    }
    const time = tRef.current;
    const freqData = getFrequencyData?.();
    for (let c = 0; c < COLS; c++) {
      let energy = 1.0;
      if (freqData) {
        const [binStart, binEnd] = BAND_RANGES[c];
        let sum = 0;
        for (let b = binStart; b < binEnd; b++) {
          sum += freqData[b] ?? 0;
        }
        energy = Math.sqrt(sum / (binEnd - binStart) / 255);
      }
      const bobGain = freqData ? 0.4 + energy : 1;
      const scaleGain = freqData ? 0.5 + energy : 1;
      const colEl = colRefs.current[c];
      if (colEl) {
        const ay = partAColumnY(time, c) * bobGain;
        colEl.style.transform = `translate(${c * 10}px, ${ay}px)`;
      }
      for (let r = 0; r < ROWS; r++) {
        const circle = circleRefs.current[c][r];
        if (!circle) {
          continue;
        }
        const [ty, s] = partBCircle(time, c, r);
        circle.style.transform = `translateY(${ty}px) scale(${s * scaleGain})`;
      }
    }
  }, isPlaying);

  return (
    <svg aria-hidden="true" className="scales" viewBox="0 0 98 108">
      <mask id={maskId}>
        <rect fill="#fff" height="10" width="10" />
      </mask>
      {COL_RANGE.map((c) => (
        <g
          key={c}
          ref={(el) => {
            colRefs.current[c] = el;
          }}
          style={{ transform: `translate(${c * 10}px, 0px)` }}
        >
          {ROW_RANGE.map((r) => (
            <g
              key={r}
              mask={`url(#${maskId})`}
              transform={`translate(0 ${r * 10})`}
            >
              <circle
                cx="5"
                cy="5"
                r="5"
                ref={(el) => {
                  circleRefs.current[c][r] = el;
                }}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center",
                }}
              />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------- Disc + layers */

const SPIN_MAX = 0.4375;
const BURST_DURATION = 620;

interface Layer {
  dir: Direction;
  id: number;
  track: Track;
}

function Disc({
  layers,
  isPlaying,
  isZoomed,
  trackKey,
  direction,
  onZoomToggle,
  onShortcut,
}: {
  layers: Layer[];
  isPlaying: boolean;
  isZoomed: boolean;
  trackKey: number;
  direction: Direction;
  onZoomToggle: () => void;
  onShortcut: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}) {
  const t = useTranslations("web.home.music");
  const spinRef = useRef<HTMLDivElement>(null);
  const rotRef = useRef(0);
  const velRef = useRef(0);
  const burstRef = useRef({ from: 0, start: 0, active: false, pending: false });
  const lastKey = useRef(trackKey);

  useEffect(() => {
    if (trackKey !== lastKey.current) {
      lastKey.current = trackKey;
      if (direction) {
        burstRef.current.from = direction === "prev" ? 360 : -360;
        burstRef.current.pending = true;
      }
    }
  }, [trackKey, direction]);

  useRafLoop((now) => {
    const el = spinRef.current;
    if (!el) {
      return;
    }
    if (isPlaying) {
      velRef.current += (SPIN_MAX - velRef.current) * 0.2;
    } else {
      velRef.current *= 0.96;
      if (velRef.current < 0.001) {
        velRef.current = 0;
      }
    }
    if (isZoomed) {
      const target = Math.round(rotRef.current / 360) * 360;
      const nx = rotRef.current + (target - rotRef.current) * 0.08;
      rotRef.current = Math.abs(target - nx) < 0.1 ? target : nx;
    } else {
      rotRef.current += velRef.current;
    }
    const burst = burstRef.current;
    if (burst.pending) {
      burst.start = now;
      burst.pending = false;
      burst.active = true;
    }
    let b = 0;
    if (burst.active) {
      const burstProgress = (now - burst.start) / BURST_DURATION;
      if (burstProgress >= 1) {
        burst.active = false;
      } else {
        b = burst.from * (1 - (1 - (1 - burstProgress) ** 3));
      }
    }
    el.style.transform = `scale(1.01) rotate(${rotRef.current + b}deg)`;
  });

  return (
    <button
      aria-label={t("toggleZoom")}
      aria-pressed={isZoomed}
      className={cn("mask", isZoomed && "is-zoomed")}
      onClick={(e) => {
        e.stopPropagation();
        onZoomToggle();
      }}
      onKeyDown={onShortcut}
      type="button"
    >
      <div className="spin" ref={spinRef}>
        {layers.map((l, i) => {
          const isNewest = i === layers.length - 1;
          let cls: string;
          if (isNewest) {
            cls = l.dir ? "cover cover-enter" : "cover";
          } else {
            cls = "cover cover-exit";
          }
          return (
            // biome-ignore lint/performance/noImgElement: animated cover stack transitions rely on layered <img> elements
            <img
              alt={`${l.track.title} — ${l.track.artist}`}
              className={cls}
              draggable={false}
              height={240}
              key={l.id}
              loading="lazy"
              sizes="(min-width: 768px) 240px, 145px"
              src={l.track.cover}
              srcSet={l.track.coverSrcSet}
              width={240}
            />
          );
        })}
      </div>
      <div className="hole">
        <div className="hole-inner" />
      </div>
    </button>
  );
}

/* ------------------------------------------------------------ TrackInfo */

function TrackInfo({ layers }: { layers: Layer[] }) {
  return (
    <div className="track-info">
      {layers.map((l, i) => {
        const isNewest = i === layers.length - 1;
        let dx: number;
        if (l.dir === "next") {
          dx = 14;
        } else if (l.dir === "prev") {
          dx = -14;
        } else {
          dx = 0;
        }
        const exitDx = -dx;
        let state: string;
        if (isNewest) {
          state = l.dir ? "ti-enter" : "";
        } else {
          state = "ti-exit";
        }
        const style = {
          ["--dx" as string]: `${isNewest ? dx : exitDx}px`,
        } as React.CSSProperties;
        return (
          <div
            aria-hidden={!isNewest}
            className={cn("ti-layer", isNewest ? "" : "ti-abs")}
            key={l.id}
          >
            <p className={cn("artist", state)} style={style}>
              {l.track.artist}
            </p>
            <h2 className={cn("track", state)} style={style}>
              {l.track.title}
            </h2>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------- ProgressBar */

function fmt(s: number): string {
  if (!Number.isFinite(s)) {
    return "0:00";
  }
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}
function ProgressBar({
  currentTime,
  duration,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  onSeek: (pct: number) => void;
}) {
  const t = useTranslations("web.home.music");
  const pct = duration ? (currentTime / duration) * 100 : 0;
  return (
    <>
      <div
        aria-label={t("seek")}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(pct)}
        className="bar"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onSeek(
            Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
          );
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            onSeek(Math.min(1, (pct + 5) / 100));
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            onSeek(Math.max(0, (pct - 5) / 100));
          } else if (e.key === "Home" || e.key === "End") {
            e.preventDefault();
            onSeek(e.key === "Home" ? 0 : 1);
          }
        }}
        role="slider"
        tabIndex={0}
      >
        <div className="bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="time">
        <span className="current">{fmt(currentTime)}</span>
        <span className="sep">/</span>
        <span className="total">{fmt(duration)}</span>
      </div>
    </>
  );
}

/* -------------------------------------------------------------- Controls */

function Controls({
  isPlaying,
  shuffled,
  loopMode,
  onToggle,
  onNext,
  onPrev,
  onShuffle,
  onLoop,
}: {
  isPlaying: boolean;
  shuffled: boolean;
  loopMode: LoopMode;
  onToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onShuffle: () => void;
  onLoop: () => void;
}) {
  const t = useTranslations("web.home.music");
  return (
    <div className="controls">
      <button
        aria-label={t("shuffle")}
        aria-pressed={shuffled}
        className={cn("ctrl", "ctrl-toggle", shuffled && "is-active")}
        onClick={onShuffle}
        type="button"
      >
        <svg
          fill="none"
          height="14"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="14"
        >
          <title>{t("shuffle")}</title>
          <path d="M16 3h5v5" />
          <path d="M21 3l-7 7" />
          <path d="M3 21l7-7" />
          <path d="M16 21h5v-5" />
          <path d="M21 21l-7-7" />
          <path d="M3 3l7 7" />
        </svg>
      </button>
      <button
        aria-label={t("previous")}
        className="ctrl"
        onClick={onPrev}
        type="button"
      >
        <svg fill="currentColor" height="16" viewBox="0 0 24 24" width="16">
          <title>{t("previous")}</title>
          <path d="M19 5L8 12l11 7zM5 5h2v14H5z" />
        </svg>
      </button>
      <button
        aria-label={t(isPlaying ? "pause" : "play")}
        className="ctrl ctrl-play"
        onClick={onToggle}
        type="button"
      >
        {isPlaying ? (
          <svg fill="currentColor" height="14" viewBox="0 0 24 24" width="14">
            <title>{t("pause")}</title>
            <path d="M6 5h3v14H6zM15 5h3v14H15z" />
          </svg>
        ) : (
          <svg fill="currentColor" height="14" viewBox="0 0 24 24" width="14">
            <title>{t("play")}</title>
            <path d="M7 5v14l11-7z" />
          </svg>
        )}
      </button>
      <button
        aria-label={t("next")}
        className="ctrl"
        onClick={onNext}
        type="button"
      >
        <svg fill="currentColor" height="16" viewBox="0 0 24 24" width="16">
          <title>{t("next")}</title>
          <path d="M5 5l11 7L5 19zM17 5h2v14h-2z" />
        </svg>
      </button>
      <button
        aria-label={t("loop")}
        aria-pressed={loopMode !== "off"}
        className={cn("ctrl", "ctrl-toggle", "ctrl-loop", {
          "is-active": loopMode !== "off",
          "mode-one": loopMode === "one",
        })}
        onClick={onLoop}
        type="button"
      >
        <svg
          fill="none"
          height="14"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="14"
        >
          <title>{t("loop")}</title>
          <path d="M4 12V8a2 2 0 0 1 2-2h12" />
          <path d="M16 3l4 3l-4 3" />
          <path d="M20 12v4a2 2 0 0 1-2 2H6" />
          <path d="M8 21l-4-3l4-3" />
        </svg>
        <span className="loop-one">1</span>
      </button>
    </div>
  );
}

/* ----------------------------------------------------- MusicPlayer root */

export interface MusicPlayerProps {
  crossOrigin?: "anonymous" | "use-credentials";
  tracks: Track[];
}

export function MusicPlayer({ tracks, crossOrigin }: MusicPlayerProps) {
  if (tracks.length === 0) {
    return null;
  }
  // Editorial playlist changes start a new session, keeping audio, shuffle
  // order, and artwork in sync. Equivalent arrays preserve playback state.
  const playlistKey = JSON.stringify(
    tracks.map(({ src, title, artist, cover, coverSrcSet }) => [
      src,
      title,
      artist,
      cover,
      coverSrcSet,
    ])
  );
  return (
    <MusicPlayerSession
      crossOrigin={crossOrigin}
      key={playlistKey}
      tracks={tracks}
    />
  );
}

function MusicPlayerSession({ tracks, crossOrigin }: MusicPlayerProps) {
  const {
    audioRef,
    state,
    currentTime,
    duration,
    currentTrack,
    toggle,
    next,
    prev,
    seek,
    seekRelative,
    toggleShuffle,
    cycleLoop,
    getFrequencyData,
  } = useAudioPlayer(tracks);
  const [isZoomed, setIsZoomed] = useState(false);
  const playerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isZoomed) {
      return;
    }
    const collapse = (event: MouseEvent) => {
      const artwork = playerRef.current?.querySelector(".mask");
      if (event.target instanceof Node && !artwork?.contains(event.target)) {
        setIsZoomed(false);
      }
    };
    document.addEventListener("click", collapse);
    return () => document.removeEventListener("click", collapse);
  }, [isZoomed]);

  const [layers, setLayers] = useState<Layer[]>(() => [
    { id: 0, track: tracks[0], dir: null },
  ]);
  const lastIndex = useRef(0);
  const idRef = useRef(1);

  useEffect(() => {
    if (state.currentIndex === lastIndex.current) {
      return;
    }
    lastIndex.current = state.currentIndex;
    const id = idRef.current++;
    setLayers((previousLayers) => [
      ...previousLayers,
      { id, track: currentTrack, dir: state.direction },
    ]);
    const cleanupTimer = setTimeout(() => {
      setLayers((previousLayers) => previousLayers.filter((l) => l.id === id));
    }, 760);
    return () => clearTimeout(cleanupTimer);
  }, [state.currentIndex, currentTrack, state.direction]);

  return (
    <section
      className={`${styles.root} music-player-widget card ${state.isPlaying ? "is-playing" : ""} ${
        isZoomed ? "is-zoomed" : ""
      }`}
      ref={playerRef}
    >
      {/* biome-ignore lint/a11y/useMediaCaption: audio element plays music tracks; captions are not applicable */}
      <audio crossOrigin={crossOrigin} preload="metadata" ref={audioRef} />
      <Disc
        direction={state.direction}
        isPlaying={state.isPlaying}
        isZoomed={isZoomed}
        layers={layers}
        onShortcut={(event) => {
          if (event.altKey || event.ctrlKey || event.metaKey) {
            return;
          }
          switch (event.key.toLowerCase()) {
            case "s":
              event.preventDefault();
              toggleShuffle();
              break;
            case "l":
              event.preventDefault();
              cycleLoop();
              break;
            case "arrowright":
              event.preventDefault();
              seekRelative(5);
              break;
            case "arrowleft":
              event.preventDefault();
              seekRelative(-5);
              break;
            default:
              break;
          }
        }}
        onZoomToggle={() => setIsZoomed((z) => !z)}
        trackKey={state.currentIndex}
      />
      <div className="info">
        <ScalesMixer
          getFrequencyData={getFrequencyData}
          isPlaying={state.isPlaying}
        />
        <TrackInfo layers={layers} />
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={seek}
        />
        <Controls
          isPlaying={state.isPlaying}
          loopMode={state.loopMode}
          onLoop={cycleLoop}
          onNext={next}
          onPrev={prev}
          onShuffle={toggleShuffle}
          onToggle={toggle}
          shuffled={state.shuffled}
        />
      </div>
    </section>
  );
}

export default MusicPlayer;
