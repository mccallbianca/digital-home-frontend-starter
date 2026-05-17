import Image from 'next/image';
import Link from 'next/link';
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
      <SiteFooter />
    </>
  );
}

const PRODUCT_LINKS = [
  { label: 'The Gap', href: '/#the-gap' },
  { label: 'How It Feels', href: '/#how-it-feels' },
  { label: 'ECQO Sound', href: '/ecqo-sound' },
  { label: 'The Science', href: '/the-science' },
  { label: "Who It's For", href: '/#who-its-for' },
  { label: 'Pricing', href: '/checkout' },
];

const LEGAL_LINKS = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'HIPAA Notice', href: '/hipaa' },
];

function SiteFooter() {
  return (
    <footer className="home-footer">
      <div className="home-footer__top">
        <div>
          <p className="home-footer__brand">
            HERR™ <span>| A product of ECQO Holdings™</span>
          </p>
        </div>

        <nav className="home-footer__links" aria-label="Product">
          {PRODUCT_LINKS.map((l) => (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ))}
        </nav>

        <nav className="home-footer__legal" aria-label="Legal">
          {LEGAL_LINKS.map((l) => (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ))}
        </nav>
      </div>

      <div className="home-footer__crisis">
        <Image
          src="/images/988-lifeline-logo.png"
          alt="988 Suicide and Crisis Lifeline"
          width={56}
          height={28}
          style={{ height: 28, width: 'auto' }}
        />
        <p className="home-footer__crisis-text">
          If you or someone you know is in crisis, call or text{' '}
          <a href="tel:988">988</a>.
        </p>
      </div>

      <div className="home-footer__bottom">
        <p className="home-footer__compliance">
          HERR is a wellness platform. It is not a substitute for licensed clinical care.
        </p>
        <p className="home-footer__powered">
          Powered by ECQO — the clinical-grade standard for ethical AI.
        </p>
        <p className="home-footer__copyright">
          © {new Date().getFullYear()} ECQO Holdings™. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
