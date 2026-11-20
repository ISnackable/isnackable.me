"use client";

import { useState } from "react";

export function usePreviewSelection(initialId: string) {
  const [selection, setSelection] = useState({ id: initialId, motion: false });

  const select = (id: string, source: "pointer" | "keyboard") => {
    setSelection((current) =>
      current.id === id ? current : { id, motion: source === "pointer" }
    );
  };

  const hover = (id: string) => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      select(id, "pointer");
    }
  };

  return { activeId: selection.id, motion: selection.motion, select, hover };
}
