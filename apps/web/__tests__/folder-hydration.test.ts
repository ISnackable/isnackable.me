// @vitest-environment jsdom

import ReactBitsFolder from "@repo/design-system/components/Folder";
import { act, createElement, type ReactElement } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

let container: HTMLDivElement;
let root: Root | undefined;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", () => 1);
  vi.stubGlobal("cancelAnimationFrame", () => undefined);
  vi.stubGlobal("matchMedia", (media: string) => ({
    matches: false,
    media,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
  container = document.createElement("div");
  document.body.append(container);
});

afterEach(() => {
  if (root) {
    act(() => root?.unmount());
    root = undefined;
  }
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function serverMarkup(element: ReactElement) {
  const browserDocument = document;
  vi.stubGlobal("document", undefined);
  try {
    return renderToString(element);
  } finally {
    vi.stubGlobal("document", browserDocument);
  }
}

function folder(paperColor?: string) {
  return createElement(ReactBitsFolder, {
    label: "Selected work",
    intro: false,
    draggable: false,
    zoomOnClick: false,
    paperColor,
  });
}

function renderedFolder() {
  const element = container.querySelector<HTMLDivElement>('[data-mode="flap"]');
  if (!element) {
    throw new Error("Expected the rendered folder");
  }
  return element;
}

test.each([undefined, "#fff", "#ffffff", "#FFFFFF"])(
  "white paper (%s) has matching server and hydrated colors without canvas access",
  async (paperColor) => {
    const canvas = vi.spyOn(HTMLCanvasElement.prototype, "getContext");
    const errors = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const recoverableError = vi.fn();
    const element = folder(paperColor);
    container.innerHTML = serverMarkup(element);
    const server = renderedFolder();
    const serverStyle = server.getAttribute("style");
    expect(server.style.getPropertyValue("--folder-paper")).toBe(
      "rgb(255, 255, 255)"
    );
    expect(server.style.getPropertyValue("--folder-paper-ink")).toBe(
      "rgb(227, 227, 227)"
    );
    expect(server.style.getPropertyValue("--folder-paper-ink-strong")).toBe(
      "rgb(184, 184, 184)"
    );
    await act(async () => {
      root = hydrateRoot(container, element, {
        onRecoverableError: recoverableError,
      });
      await Promise.resolve();
    });
    expect(renderedFolder()).toBe(server);
    expect(renderedFolder().getAttribute("style")).toBe(serverStyle);
    expect(canvas).not.toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
    expect(recoverableError).not.toHaveBeenCalled();
  }
);

test("browser-only CSS colors hydrate consistently even after their resolved values are cached", async () => {
  const context = {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: "",
    getImageData: () => ({ data: new Uint8ClampedArray([255, 255, 255, 255]) }),
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    context as unknown as CanvasRenderingContext2D
  );
  const errors = vi.spyOn(console, "error").mockImplementation(() => undefined);
  const recoverableError = vi.fn();
  const element = folder("white");
  const markup = serverMarkup(element);
  container.innerHTML = markup;
  await act(async () => {
    root = hydrateRoot(container, element, {
      onRecoverableError: recoverableError,
    });
    await Promise.resolve();
  });
  expect(renderedFolder().style.getPropertyValue("--folder-paper")).toBe(
    "rgb(255, 255, 255)"
  );
  expect(serverMarkup(element)).toBe(markup);
  expect(errors).not.toHaveBeenCalled();
  expect(recoverableError).not.toHaveBeenCalled();
});
