// @vitest-environment jsdom

import { Activity, act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  MusicPlayer,
  type Track,
} from "../app/(main)/[locale]/(home)/components/music-player-widget";

vi.mock("@repo/internationalization/client", () => ({
  useTranslations: () => (key: string) => key,
}));

const tracks: Track[] = ["A", "B", "C"].map((title) => ({
  title,
  artist: "Artist",
  cover: `https://example.com/${title}.jpg`,
  src: `https://example.com/${title}.mp3`,
}));

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", () => 1);
  vi.stubGlobal("cancelAnimationFrame", () => undefined);
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(
    () => undefined
  );
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(
    () => undefined
  );
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function renderPlayer(playlist: Track[]) {
  act(() => root.render(createElement(MusicPlayer, { tracks: playlist })));
}

function renderActivity(mode: "visible" | "hidden") {
  act(() =>
    root.render(
      createElement(Activity, {
        mode,
        // biome-ignore lint/correctness/noChildrenProp: ActivityProps requires children in the createElement props argument.
        children: createElement(MusicPlayer, { tracks }),
      })
    )
  );
}

function nextTrack() {
  const button = container.querySelector<HTMLButtonElement>(
    'button[aria-label="next"]'
  );
  if (!button) {
    throw new Error("Expected the Next track button");
  }
  act(() => button.click());
  act(() => vi.advanceTimersByTime(800));
}

function expectTrack(track: Track) {
  expect(container.querySelector("audio")?.src).toBe(track.src);
  expect(container.querySelector("img")?.src).toBe(track.cover);
  expect(container.querySelector("img")?.alt).toBe(
    `${track.title} — ${track.artist}`
  );
}

test("CMS title, artwork and audio edits start a consistent new playback session", () => {
  renderPlayer(tracks);
  nextTrack();
  const edited = tracks.map((track) => ({
    ...track,
    title: `${track.title} edited`,
    cover: track.cover.replace(".jpg", "-edited.jpg"),
    src: track.src.replace(".mp3", "-edited.mp3"),
  }));
  renderPlayer(edited);
  expectTrack(edited[0]);
  nextTrack();
  expectTrack(edited[1]);
});

test("removing the selected track cannot leave invalid playback indexes", () => {
  renderPlayer(tracks);
  nextTrack();
  nextTrack();
  expectTrack(tracks[2]);
  renderPlayer([tracks[0]]);
  expectTrack(tracks[0]);
  nextTrack();
  expectTrack(tracks[0]);
});

test("reordered tracks follow the new editorial order", () => {
  renderPlayer(tracks);
  nextTrack();
  renderPlayer([tracks[2], tracks[0], tracks[1]]);
  expectTrack(tracks[2]);
  nextTrack();
  expectTrack(tracks[0]);
});

test("equivalent CMS data preserves the current track and does not reload audio", () => {
  renderPlayer(tracks);
  nextTrack();
  const audio = container.querySelector("audio");
  const loads = vi.mocked(HTMLMediaElement.prototype.load).mock.calls.length;
  renderPlayer(tracks.map((track) => ({ ...track })));
  expectTrack(tracks[1]);
  expect(container.querySelector("audio")).toBe(audio);
  expect(HTMLMediaElement.prototype.load).toHaveBeenCalledTimes(loads);
});

test("responsive artwork survives track changes and CMS edits", () => {
  const responsive = tracks.map((track) => ({
    ...track,
    coverSrcSet: `${track.cover}?w=240 240w, ${track.cover}?w=480 480w`,
  }));
  renderPlayer(responsive);
  nextTrack();
  expect(container.querySelector("img")?.getAttribute("srcset")).toBe(
    responsive[1].coverSrcSet
  );
  expect(container.querySelector("img")?.sizes).toBe(
    "(min-width: 768px) 240px, 145px"
  );
  const edited = responsive.map((track) => ({
    ...track,
    coverSrcSet: `${track.cover}?w=240&q=60 240w`,
  }));
  renderPlayer(edited);
  expectTrack(edited[0]);
  expect(container.querySelector("img")?.getAttribute("srcset")).toBe(
    edited[0].coverSrcSet
  );
});

test("an empty playlist removes the player and stops its audio", () => {
  renderPlayer(tracks);
  renderPlayer([]);
  expect(container.childElementCount).toBe(0);
  expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
});

test("Activity restoration preserves the selected audio source and artwork", () => {
  renderActivity("visible");
  nextTrack();
  expectTrack(tracks[1]);
  const audio = container.querySelector("audio");
  const loads = vi.mocked(HTMLMediaElement.prototype.load).mock.calls.length;
  renderActivity("hidden");
  renderActivity("visible");
  expect(container.querySelector("audio")).toBe(audio);
  expectTrack(tracks[1]);
  expect(HTMLMediaElement.prototype.load).toHaveBeenCalledTimes(loads);
});

test("Activity suspends and reuses the audio connection until the player is removed", () => {
  const createSource = vi.fn(() => ({ connect: vi.fn() }));
  const suspend = vi.fn().mockResolvedValue(undefined);
  const resume = vi.fn().mockResolvedValue(undefined);
  const close = vi.fn().mockResolvedValue(undefined);
  const createAnalyser = vi.fn(() => ({
    frequencyBinCount: 128,
    connect: vi.fn(),
    getByteFrequencyData: vi.fn(),
  }));
  vi.stubGlobal(
    "AudioContext",
    class {
      state = "running";
      destination = {};
      createMediaElementSource = createSource;
      suspend = suspend;
      resume = resume;
      close = close;
      createAnalyser = createAnalyser;
    }
  );
  renderActivity("visible");
  act(() => container.querySelector("audio")?.dispatchEvent(new Event("play")));
  expect(createSource).toHaveBeenCalledTimes(1);
  renderActivity("hidden");
  expect(suspend).toHaveBeenCalledTimes(1);
  expect(close).not.toHaveBeenCalled();
  renderActivity("visible");
  act(() => container.querySelector("audio")?.dispatchEvent(new Event("play")));
  expect(createSource).toHaveBeenCalledTimes(1);
  expect(resume).toHaveBeenCalled();
  act(() => root.render(null));
  expect(close).toHaveBeenCalledTimes(1);
});

test("player shortcuts leave unrelated buttons and editable fields alone", () => {
  renderPlayer(tracks);
  for (const tag of ["button", "textarea", "input"]) {
    const control = document.createElement(tag);
    container.append(control);
    const key = new KeyboardEvent("keydown", {
      key: " ",
      bubbles: true,
      cancelable: true,
    });
    act(() => {
      control.dispatchEvent(key);
    });
    expect(key.defaultPrevented).toBe(false);
  }
  expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
});

test("a slider arrow seeks once and prevents page scrolling", () => {
  renderPlayer(tracks);
  const audio = container.querySelector("audio");
  const slider = container.querySelector('[role="slider"]');
  if (!(audio && slider)) {
    throw new Error("Expected the audio and seek slider");
  }
  Object.defineProperty(audio, "duration", { configurable: true, value: 100 });
  const key = new KeyboardEvent("keydown", {
    key: "ArrowRight",
    bubbles: true,
    cancelable: true,
  });
  act(() => {
    slider.dispatchEvent(key);
  });
  expect(audio.currentTime).toBe(5);
  expect(key.defaultPrevented).toBe(true);
});

test("the focused artwork retains scoped player shortcuts", () => {
  renderPlayer(tracks);
  const artwork = container.querySelector<HTMLElement>(".mask");
  if (!artwork) {
    throw new Error("Expected focusable artwork");
  }
  act(() => {
    artwork.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "s",
        bubbles: true,
        cancelable: true,
      })
    );
  });
  expect(
    container
      .querySelector('[aria-label="shuffle"]')
      ?.classList.contains("is-active")
  ).toBe(true);
});

test("artwork shortcuts preserve browser shortcuts and native zoom activation", () => {
  renderPlayer(tracks);
  const artwork = container.querySelector<HTMLButtonElement>(".mask");
  const shuffle = container.querySelector('[aria-label="shuffle"]');
  expect(artwork?.tagName).toBe("BUTTON");
  const save = new KeyboardEvent("keydown", {
    key: "s",
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
  });
  act(() => artwork?.dispatchEvent(save));
  expect(save.defaultPrevented).toBe(false);
  expect(shuffle?.getAttribute("aria-pressed")).toBe("false");
  act(() => artwork?.click());
  expect(artwork?.getAttribute("aria-pressed")).toBe("true");
  act(() => document.body.click());
  expect(artwork?.getAttribute("aria-pressed")).toBe("false");
});

test("reduced motion stops animation frames even while audio is playing", () => {
  const preference = {
    matches: true,
    addEventListener: vi.fn<(event: string, listener: () => void) => void>(),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal("matchMedia", () => preference);
  const scheduleFrame = vi.fn(() => 1);
  vi.stubGlobal("requestAnimationFrame", scheduleFrame);
  renderPlayer(tracks);
  act(() => container.querySelector("audio")?.dispatchEvent(new Event("play")));
  expect(container.querySelector(".is-playing")).not.toBeNull();
  expect(scheduleFrame).not.toHaveBeenCalled();

  preference.matches = false;
  act(() => {
    for (const [, listener] of preference.addEventListener.mock.calls) {
      (listener as () => void)();
    }
  });
  expect(scheduleFrame).toHaveBeenCalled();
});
