import type { Metadata, Viewport } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ServiceWorkerRegister } from '@/components/providers/ServiceWorkerRegister';
import { buildDefaultMetadata, personJsonLd } from '@/lib/seo';

// Variable fonts loaded via next/font (self-hosted, zero layout shift).
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});
const sora = Sora({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = buildDefaultMetadata();

export const viewport: Viewport = {
  themeColor: '#0A0A0B',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="hu"
      className={`${inter.variable} ${sora.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        {/* Person/Profile structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
        />
      </head>
      <body className="min-h-dvh font-sans">
        <ThemeProvider>
          {/* Skip link for accessibility */}
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-pink focus:px-4 focus:py-2 focus:text-white"
          >
            Ugrás a tartalomhoz
          </a>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
