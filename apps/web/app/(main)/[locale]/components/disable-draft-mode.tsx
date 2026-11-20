"use client";

import { useIsPresentationTool } from "next-sanity/hooks";
import { useState } from "react";

/**
 * Floating "Disable Draft Mode" button.
 *
 * Renders only when Draft Mode is enabled AND the page is NOT being viewed
 * inside the Presentation Tool iframe (which has its own exit affordances).
 * Follows the official next-sanity recommendation:
 * https://www.sanity.io/docs/visual-editing/visual-editing-with-next-js-app-router
 */
export function DisableDraftMode() {
  const isPresentationTool = useIsPresentationTool();
  const [hidden, setHidden] = useState(false);

  // Hide once clicked; the route handler disables the cookie.
  if (isPresentationTool || hidden) {
    return null;
  }

  return (
    <a
      className="fixed right-4 bottom-4 z-50 rounded-full bg-red-500 px-4 py-2 font-semibold text-sm text-white shadow-lg hover:bg-red-600"
      href="/api/draft-mode/disable"
      onClick={() => setHidden(true)}
    >
      Disable Draft Mode
    </a>
  );
}
