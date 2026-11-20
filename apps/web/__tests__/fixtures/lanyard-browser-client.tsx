import { useTheme } from "@repo/design-system/client";
import { ThemeProvider } from "@repo/design-system/providers/theme";
import { Activity, useState } from "react";
import { createRoot } from "react-dom/client";
import { Lanyard } from "../../app/(main)/[locale]/(home)/components/lanyard";

import type { LanyardPreview } from "../../app/(main)/[locale]/(home)/components/lanyard-preview";
import { fixtureDictionary, fixturePortrait } from "./lanyard-data";

declare global {
  // biome-ignore lint/style/useVarsOnTop: Global declarations describe test-injected values.
  var __lanyardPreview: LanyardPreview | undefined;
  // biome-ignore lint/style/useVarsOnTop: Global declarations describe test-injected values.
  var __lanyardInitialPortrait: string | undefined;
}

function Fixture() {
  const [updated, setUpdated] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [portrait, setPortrait] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [stalled, setStalled] = useState(false);
  const { setTheme } = useTheme();
  return (
    <>
      <nav>
        <button onClick={() => setUpdated(true)} type="button">
          Update badge
        </button>
        <button onClick={() => setTheme("dark")} type="button">
          Dark theme
        </button>
        <button onClick={() => setMounted((value) => !value)} type="button">
          Toggle badge
        </button>
        <button onClick={() => setPortrait((value) => !value)} type="button">
          Toggle portrait
        </button>
        <button onClick={() => setHidden((value) => !value)} type="button">
          Hide or restore badge
        </button>
        <button onClick={() => setStalled(true)} type="button">
          Stall portrait
        </button>
      </nav>
      <div className="lanyard-host">
        <Activity mode={hidden ? "hidden" : "visible"}>
          {mounted ? (
            <Lanyard
              avatarUrl={
                stalled
                  ? "https://lanyard.test/stalled.png"
                  : portrait
                    ? fixturePortrait
                    : globalThis.__lanyardInitialPortrait
              }
              dictionary={{
                badgeProfile: {
                  ...fixtureDictionary.badgeProfile,
                  name: updated ? "Updated identity" : "Alex",
                },
                cardBackProfile: {
                  ...fixtureDictionary.cardBackProfile,
                  title: updated ? "Updated back" : "Access Profile",
                },
              }}
              fov={11}
              preview={
                updated || portrait ? undefined : globalThis.__lanyardPreview
              }
            />
          ) : null}
        </Activity>
      </div>
    </>
  );
}

const container = document.querySelector("#lanyard-fixture");
if (container) {
  createRoot(container).render(
    <ThemeProvider defaultTheme="light" enableSystem={false}>
      <Fixture />
    </ThemeProvider>
  );
}
