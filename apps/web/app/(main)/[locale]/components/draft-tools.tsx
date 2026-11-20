"use client";

import dynamic from "next/dynamic";

const VisualEditing = dynamic(
  () =>
    import("next-sanity/visual-editing").then((module) => module.VisualEditing),
  { ssr: false }
);
const DisableDraftMode = dynamic(
  () =>
    import("./disable-draft-mode").then((module) => module.DisableDraftMode),
  { ssr: false }
);

/** Editor overlays are downloaded only when this draft-only component mounts. */
export function DraftTools() {
  return (
    <>
      <VisualEditing />
      <DisableDraftMode />
    </>
  );
}
