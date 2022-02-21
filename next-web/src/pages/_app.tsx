import "@styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import {
  MantineProvider
  // ColorSchemeProvider,
  // ColorScheme
} from "@mantine/core";
// import { useHotkeys, useLocalStorageValue } from "@mantine/hooks";
import Layout from "@components/layout";

const MyApp = ({ Component, pageProps }: AppProps) => {
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
        theme={{ colorScheme: "dark" }}
      >
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </MantineProvider>
    </>
  );
};

export default MyApp;
