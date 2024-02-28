import type { Metadata } from 'next';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';

import { ThemeProvider } from '@/components/theme-provider';
import { author, description, host, name } from '@/lib/config';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(host),
  title: {
    default: author,
    template: `%s | ${name}`,
  },
  description: description || 'Developer, writer, and creator.',
  openGraph: {
    title: author,
    description: description || 'Developer, writer, and creator.',
    url: host,
    siteName: author,
    locale: 'en_US',
    type: 'website',
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
      <head />
      <body className='min-h-screen bg-background font-sans text-foreground antialiased'>
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
