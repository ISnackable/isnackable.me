// @vitest-environment jsdom

import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { Folder } from "../app/(main)/[locale]/(home)/components/folder";

vi.mock("@repo/design-system/client", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

let container: HTMLDivElement;
let root: Root;

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
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() =>
    root.render(
      createElement(
        Folder,
        { label: "Selected work" },
        createElement(
          "a",
          { href: "/en/projects/one", key: "project" },
          "Project one"
        ),
        createElement("a", { href: "/en/blog/two", key: "post" }, "Article two")
      )
    )
  );
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function trigger() {
  const button = container.querySelector<HTMLButtonElement>(
    "button[aria-controls]"
  );
  if (!button) {
    throw new Error("Expected a native folder button");
  }
  return button;
}

function items() {
  const target = document.querySelector(
    `[id="${trigger().getAttribute("aria-controls")}"]`
  );
  if (!target) {
    throw new Error("Expected the controlled content");
  }
  return target;
}

test("the real registry component keeps closed cards inert and exposes native links when opened", () => {
  expect(trigger().getAttribute("aria-expanded")).toBe("false");
  expect(items().hasAttribute("inert")).toBe(true);
  act(() => trigger().click());
  expect(trigger().getAttribute("aria-expanded")).toBe("true");
  expect(items().hasAttribute("inert")).toBe(false);
  expect(items().querySelectorAll("a")).toHaveLength(2);
  expect(items().querySelector('[role="button"]')).toBeNull();
  const link = items().querySelector("a");
  const key = new KeyboardEvent("keydown", {
    key: "Enter",
    bubbles: true,
    cancelable: true,
  });
  act(() => link?.dispatchEvent(key));
  expect(key.defaultPrevented).toBe(false);
  expect(trigger().getAttribute("aria-expanded")).toBe("true");
});

test("Escape closes the folder and returns focus from a card to its trigger", () => {
  act(() => trigger().click());
  act(() => items().querySelector("a")?.focus());
  act(() =>
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
    )
  );
  expect(trigger().getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(trigger());
  expect(items().hasAttribute("inert")).toBe(true);
});

test("outside pointer actions and moving focus out close the folder", () => {
  act(() => trigger().click());
  act(() =>
    document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }))
  );
  expect(trigger().getAttribute("aria-expanded")).toBe("false");
  act(() => trigger().click());
  const outside = document.createElement("button");
  container.append(outside);
  act(() => outside.focus());
  expect(trigger().getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(outside);
});
