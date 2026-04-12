import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import NavBar from '@/components/layout/NavBar';
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
    default: 'HERR — Human Existential Response and Reprogramming',
    template: '%s — HERR',
  },
  description:
    'HERR is a clinical wellness operating system that delivers personalized voice affirmations in your own cloned voice. Regulate your nervous system. Reprogram your inner voice. Founded by Bianca D. McCall, LMFT.',
  metadataBase: new URL('https://www.h3rr.com'),
  openGraph: {
    siteName: 'HERR by ECQO Holdings',
    url: 'https://www.h3rr.com',
    type: 'website',
  },
  authors: [{ name: 'Bianca D. McCall, LMFT' }],
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
        <NavBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '64px 24px',
        background: '#0A0A0F',
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
        {/* Brand */}
        <p
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 18,
            color: '#FFFFFF',
            marginBottom: 24,
          }}
        >
          HERR™{' '}
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
            | A product of ECQO Holdings™
          </span>
        </p>

        {/* Primary nav */}
        <nav
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px 20px',
            marginBottom: 24,
          }}
        >
          {[
            { label: 'About', href: '/about' },
            { label: 'How It Works', href: '/how-it-works' },
            { label: 'The Science', href: '/the-science' },
            { label: 'Journal', href: '/journal' },
            { label: 'ECQO Sound', href: '/ecqo-sound' },
            { label: 'Pricing', href: '/checkout' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Legal nav */}
        <nav
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px 20px',
            marginBottom: 32,
          }}
        >
          {[
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'HIPAA Notice', href: '/hipaa' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Disclaimer */}
        <p
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.35)',
            lineHeight: 1.6,
            maxWidth: 600,
            margin: '0 auto 16px',
          }}
        >
          HERR is a wellness platform. It is not a substitute for licensed clinical care.
          If you are in crisis, call or text{' '}
          <a
            href="tel:988"
            style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}
          >
            988
          </a>
          .
        </p>

        {/* Copyright */}
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          © {new Date().getFullYear()} ECQO Holdings™. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
