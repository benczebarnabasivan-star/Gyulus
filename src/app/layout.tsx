import type { Metadata, Viewport } from 'next';

import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Resonance — your Spotify, your festival summer',
    template: '%s · Resonance',
  },
  description:
    'Connect Spotify to see what you actually listen to, then find the festivals your artists are playing — with the day, the stage and the set time.',
  applicationName: 'Resonance',
  openGraph: {
    title: 'Resonance — your Spotify, your festival summer',
    description:
      'Festival recommendations built from your real listening history, down to individual set times.',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#05040a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink-950">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-spot focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
