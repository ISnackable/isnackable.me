/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import Head from "next/head";
import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider
} from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { useColorScheme, useHotkeys } from "@mantine/hooks";
import { AnimatePresence } from "framer-motion";
import PlausibleProvider from "next-plausible";
import AppLayout from "@components/AppLayout";
import { siteUrl } from "@lib/config";
import "@styles/globals.css";

const SITE_ID = siteUrl.replace("https://", "");

const App = ({ Component, pageProps }: AppProps) => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("dark");
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));
  const preferredColorScheme = useColorScheme();

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  useEffect(() => {
    setColorScheme(preferredColorScheme);
  }, [preferredColorScheme]);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
      </Head>
      <PlausibleProvider domain={SITE_ID}>
        <ColorSchemeProvider
          colorScheme={colorScheme}
          toggleColorScheme={toggleColorScheme}
        >
          <MantineProvider
            withGlobalStyles
            withNormalizeCSS
            theme={{ colorScheme }}
          >
            <NotificationsProvider>
              <AnimatePresence exitBeforeEnter initial={false}>
                <AppLayout>
                  <Component {...pageProps} />
                </AppLayout>
              </AnimatePresence>
            </NotificationsProvider>
          </MantineProvider>
        </ColorSchemeProvider>
      </PlausibleProvider>
    </>
  );
};

export default App;
