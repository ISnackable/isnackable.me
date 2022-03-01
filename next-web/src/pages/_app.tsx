import "@styles/globals.css";
import { useState } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { MantineProvider, ColorScheme } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { useHotkeys } from "@mantine/hooks";
import AppLayout from "@components/AppLayout";

const MyApp = ({ Component, pageProps }: AppProps) => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("dark");
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
      </Head>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{ colorScheme }}
      >
        <NotificationsProvider>
          <AppLayout
            colorScheme={colorScheme}
            toggleColorScheme={toggleColorScheme}
          >
            <Component {...pageProps} />
          </AppLayout>
        </NotificationsProvider>
      </MantineProvider>
    </>
  );
};

export default MyApp;
