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
    <footer className="border-t border-[var(--herr-border)] bg-[var(--herr-black)] px-6 py-14">
      <div className="max-w-[1200px] mx-auto">

        {/* Top row */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 mb-12">

          {/* Brand */}
          <div className="max-w-xs">
            <p className="font-display text-2xl font-light tracking-widest uppercase text-[var(--herr-white)] mb-3">
              HERR™
            </p>
            <p className="text-[0.78rem] text-[var(--herr-muted)] leading-relaxed">
              Human Existential Response and Reprogramming™. A clinical wellness operating system founded by Bianca D. McCall, LMFT.
            </p>
            <p className="text-[0.68rem] text-[var(--herr-faint)] mt-3 tracking-wide">
              h3rr.com — the 3 represents the three dimensions of human experience HERR™ addresses: Existential, Emotional, and Executive. One tool. Every version of you.
            </p>
          </div>

          {/* Nav */}
          <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-[0.8rem]">
            {[
              { label: 'Home', href: '/' },
              { label: 'About', href: '/about' },
              { label: 'How It Works', href: '/how-it-works' },
              { label: 'Subscribe', href: '/subscribe' },
              { label: 'ECQO Sound', href: '/ecqo-sound' },
              { label: 'The Science', href: '/science' },
              { label: 'For Practitioners', href: '/practitioners' },
              { label: 'Journal', href: '/journal' },
              { label: 'Contact', href: '/contact' },
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[var(--herr-muted)] hover:text-[var(--herr-white)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Disclaimer + Legal */}
        <div className="border-t border-[var(--herr-border)] pt-8 flex flex-col gap-2">
          <p className="text-[0.72rem] text-[var(--herr-faint)] leading-relaxed max-w-3xl">
            HERR™ is a wellness tool and is not a substitute for professional mental health treatment. Always consult a licensed clinician for clinical concerns.
          </p>
          <p className="text-[0.72rem] text-[var(--herr-faint)] leading-relaxed max-w-3xl">
            The HERR™ Progressive Reprogramming System — Patent Pending. HERR™ and Human Existential Response and Reprogramming™ are trademarks of ECQO Holdings™. Unauthorized use is prohibited.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-[0.72rem] text-[var(--herr-faint)]">
              © {new Date().getFullYear()} ECQO Holdings™. All rights reserved.
            </p>
            <a href="/privacy" className="text-[0.72rem] text-[var(--herr-faint)] hover:text-[var(--herr-muted)] transition-colors">Privacy Policy</a>
            <a href="/terms" className="text-[0.72rem] text-[var(--herr-faint)] hover:text-[var(--herr-muted)] transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
