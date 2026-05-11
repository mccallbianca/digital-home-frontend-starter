import NavBar from '@/components/layout/NavBar';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      {children}
      <Footer />
    </>
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
              style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}
            >
              {link.label}
            </a>
          ))}
        </nav>

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
              style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}
            >
              {link.label}
            </a>
          ))}
        </nav>

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

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          © {new Date().getFullYear()} ECQO Holdings™. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
