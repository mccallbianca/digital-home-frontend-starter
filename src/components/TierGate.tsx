import Link from 'next/link';

const TIER_NAMES: Record<string, string> = {
  collective: 'HERR Collective',
  personalized: 'HERR Personalized',
  elite: 'HERR Elite',
};

interface TierGateProps {
  requiredTier: 'collective' | 'personalized' | 'elite';
  featureName: string;
  children?: React.ReactNode;
}

export default function TierGate({ requiredTier, featureName, children }: TierGateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        textAlign: 'center',
        minHeight: '40vh',
      }}
    >
      {/* Lock icon */}
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginBottom: 16 }}
      >
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>

      <h2
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 24,
          color: '#FFFFFF',
          marginBottom: 8,
        }}
      >
        Unlock {featureName}
      </h2>

      <p
        style={{
          fontSize: 15,
          color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.6,
          maxWidth: 420,
          marginBottom: 24,
        }}
      >
        {children || `Upgrade to ${TIER_NAMES[requiredTier]} to access ${featureName.toLowerCase()}.`}
      </p>

      <Link
        href={`/checkout?tier=${requiredTier}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 48,
          padding: '0 32px',
          background: '#C42D8E',
          color: '#FFFFFF',
          borderRadius: 12,
          border: 'none',
          fontSize: 14,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          textDecoration: 'none',
        }}
      >
        Upgrade to {TIER_NAMES[requiredTier]}
      </Link>

      <p
        style={{
          fontSize: 13,
          color: 'rgba(255,255,255,0.35)',
          marginTop: 12,
        }}
      >
        Cancel anytime. No contracts.
      </p>
    </div>
  );
}
