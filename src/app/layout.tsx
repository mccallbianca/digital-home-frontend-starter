import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import './globals.css';

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

export const metadata: Metadata = {
  title: {
    default: 'HERR | Human Existential Regulator and Reprogramming',
    template: '%s | HERR',
  },
  description:
    'HERR is a clinical wellness operating system that delivers personalized voice affirmations in your own cloned voice. Regulate your nervous system. Reprogram your inner voice. Founded by Bianca D. McCall, M.A., LMFT.',
  metadataBase: new URL('https://www.h3rr.com'),
  openGraph: {
    siteName: 'HERR by ECQO Holdings',
    url: 'https://www.h3rr.com',
    type: 'website',
  },
  authors: [{ name: 'Bianca D. McCall, M.A., LMFT' }],
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
      <body className={`${cormorant.variable} ${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
