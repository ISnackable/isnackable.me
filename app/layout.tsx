import type { Metadata, Viewport } from 'next';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';

import { Header } from '@/components/header';
import { ThemeProvider } from '@/components/theme-provider';
import {
  author,
  description,
  enableVercelAnalytics,
  enableVercelSpeedInsights,
  host,
  name,
} from '@/lib/config';
import '@/styles/globals.css';

export const metadata: Metadata = {
  applicationName: `${author} | ${name}`,
  metadataBase: new URL(host),
  title: {
    default: author,
    template: `%s | ${name}`,
  },
  description: description || 'Developer, writer, and creator.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: author,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: author,
    title: {
      default: author,
      template: `%s | ${name}`,
    },
    description: description || 'Developer, writer, and creator.',
    url: host,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: {
      default: author,
      template: `%s | ${name}`,
    },
    description: description || 'Developer, writer, and creator.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  colorScheme: 'dark light',
  width: 'device-width',
  minimumScale: 1,
  initialScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* We're not using viewport variable to define these theme-colors as we want it to persist when route changes */}
        <meta
          name='theme-color'
          content='#09090b'
          media='(prefers-color-scheme: dark)'
        />
        <meta
          name='theme-color'
          media='(prefers-color-scheme: light)'
          content='#ffffff'
        />
      </head>
      <body className='min-h-screen bg-background font-sans text-foreground antialiased'>
        <ThemeProvider
          value={{ light: 'light-mode', dark: 'dark-mode' }}
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {children}
        </ThemeProvider>
        {enableVercelAnalytics && <Analytics />}
        {enableVercelSpeedInsights && <SpeedInsights />}
      </body>
    </html>
  );
}
