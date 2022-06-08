/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { createGetInitialProps } from "@mantine/next";
import Document, { Html, Head, Main, NextScript } from "next/document";
import { title, description } from "@lib/config";

const getInitialProps = createGetInitialProps();

export default class _Document extends Document {
  static getInitialProps = getInitialProps;

  render() {
    return (
      <Html>
        <Head>
          <meta name="application-name" content={title} />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />
          <meta name="apple-mobile-web-app-title" content={title} />
          <meta name="description" content={description} />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          {/* <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#1A1B1E" />
        <meta name="msapplication-tap-highlight" content="no" /> */}
          <meta
            name="theme-color"
            content="#1A1B1E"
            media="(prefers-color-scheme: dark)"
          />

          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            href="/icons/favicon-72x72.png"
            rel="icon"
            type="image/png"
            sizes="72x72"
          />
          <link
            href="/icons/favicon-48x48.png"
            rel="icon"
            type="image/png"
            sizes="48x48"
          />
          <link rel="manifest" href="/manifest.webmanifest" />
          <link rel="shortcut icon" href="/favicon.ico" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
