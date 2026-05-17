import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans, Inter } from 'next/font/google';
import './globals.css';
import PWAServiceWorkerRegister from '@/components/PWAServiceWorkerRegister';
import TesterBugReportButton from '@/components/TesterBugReportButton';

const cormorant = Cormorant_Garamond({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const dmSans = DM_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
});

// Homepage-only display + body font. Other marketing pages keep
// Cormorant Garamond + DM Sans so editorial subpages stay consistent.
const inter = Inter({
  variable: '--font-sans-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
});

// Brand strings come from env so future ECQO verticals can rebrand
// without touching code. See src/core/README.md.
const PRODUCT_NAME = process.env.NEXT_PUBLIC_PRODUCT_NAME || 'HERR';
const PRODUCT_LONG_NAME = process.env.NEXT_PUBLIC_PRODUCT_LONG_NAME || 'Human Existential Regulator and Reprogramming';
const FOUNDER_CREDENTIAL = process.env.NEXT_PUBLIC_PRODUCT_FOUNDER_CREDENTIAL || 'Bianca D. McCall, M.A., LMFT';

export const metadata: Metadata = {
  title: {
    default: `${PRODUCT_NAME} | ${PRODUCT_LONG_NAME}`,
    template: `%s | ${PRODUCT_NAME}`,
  },
  description:
    `${PRODUCT_NAME} is a clinical wellness operating system that delivers personalized voice affirmations in your own cloned voice. Regulate your nervous system. Reprogram your inner voice. Founded by ${FOUNDER_CREDENTIAL}.`,
  metadataBase: new URL('https://www.h3rr.com'),
  openGraph: {
    siteName: `${PRODUCT_NAME} by ECQO Holdings`,
    url: 'https://www.h3rr.com',
    type: 'website',
  },
  authors: [{ name: FOUNDER_CREDENTIAL }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: PRODUCT_NAME,
    statusBarStyle: 'black-translucent',
  },
  icons: {
    apple: '/icons/icon-192.png',
  },
};

export const viewport = {
  themeColor: '#C42D8E',
};

// Catches Supabase implicit-flow tokens that land on any page (e.g. homepage)
// and immediately redirects to /auth/callback so the session is established.
function AuthHashInterceptor() {
  const script = `
    (function() {
      var hash = window.location.hash;
      if (hash && hash.includes('access_token=')) {
        var next = '/dashboard';
        window.location.replace('/auth/callback?next=' + encodeURIComponent(next) + hash);
      }
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <AuthHashInterceptor />
      </head>
      <body className={`${cormorant.variable} ${dmSans.variable} ${inter.variable} antialiased`}>
        <PWAServiceWorkerRegister />
        {children}
        <TesterBugReportButton />
      </body>
    </html>
  );
}
