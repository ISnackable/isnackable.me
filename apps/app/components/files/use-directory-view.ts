"use client";

import type { FileSystemView } from "@repo/design-system/components/extend/file-system";
import { useSyncExternalStore } from "react";

const viewKey = "files:view";
const viewEvent = "files:view-changed";
let fallbackView: FileSystemView | undefined;

function subscribeView(change: () => void) {
  window.addEventListener("storage", change);
  window.addEventListener(viewEvent, change);
  return () => {
    window.removeEventListener("storage", change);
    window.removeEventListener(viewEvent, change);
  };
}

function readView(): FileSystemView {
  if (fallbackView) {
    return fallbackView;
  }
  try {
    return window.localStorage.getItem(viewKey) === "icons" ? "icons" : "list";
  } catch {
    return "list";
  }
}

function writeView(view: FileSystemView) {
  try {
    window.localStorage.setItem(viewKey, view);
    fallbackView = undefined;
  } catch {
    fallbackView = view;
  }
  window.dispatchEvent(new Event(viewEvent));
}

export function useDirectoryView() {
  const view = useSyncExternalStore<FileSystemView>(
    subscribeView,
    readView,
    () => "list"
  );
  return [view, writeView] as const;
}
