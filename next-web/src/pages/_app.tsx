import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import Head from "next/head";
import { ColorScheme, MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { useColorScheme, useHotkeys } from "@mantine/hooks";
import { AnimatePresence } from "framer-motion";
import { ColorSchemeProvider } from "@components/ColorSchemeProvider";
import AppLayout from "@components/AppLayout";
import "@styles/globals.css";

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
    </>
  );
};

export default App;
