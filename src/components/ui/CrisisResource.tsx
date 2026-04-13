import Image from 'next/image';

/**
 * 988 Suicide & Crisis Lifeline signage component.
 * Displays on every public page above the main footer.
 * Uses official 988 logo (unmodified) with HERR brand container.
 */
export default function CrisisResource({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const isLight = variant === 'light';

  return (
    <section
      role="complementary"
      aria-label="Crisis resources"
      style={{
        background: isLight ? '#F4F1EB' : '#0A0A0F',
        padding: '32px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: 600,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Image
          src={isLight ? '/images/988-lifeline-logo.svg' : '/images/988-lifeline-logo-white.svg'}
          alt="988 Suicide and Crisis Lifeline"
          width={200}
          height={48}
          style={{ height: 'auto' }}
        />
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: isLight ? '#1A1A2E' : '#FFFFFF',
            margin: 0,
          }}
        >
          If you or someone you know is in crisis, call or text{' '}
          <a
            href="tel:988"
            style={{
              color: isLight ? '#1A1A2E' : '#FFFFFF',
              fontWeight: 700,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            988
          </a>
        </p>
      </div>
    </section>
  );
}
