import type { Metadata } from 'next';
import AnnounceFixForm from './AnnounceFixForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Announce Bug Fix | HERR Admin',
  description: 'Post a fix announcement to the HERR Beta Testers chat.',
};

export default function AnnounceFixPage() {
  const deployVersion = process.env.NEXT_PUBLIC_DEPLOY_VERSION || '';

  return (
    <main style={{ minHeight: '100vh', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <p
          style={{
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--herr-magenta)',
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Admin &middot; Bug Fix Announcement
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 34,
            fontWeight: 500,
            color: 'var(--herr-ink)',
            marginBottom: 8,
          }}
        >
          Announce a fix to the Beta Testers
        </h1>
        <p style={{ fontSize: 15, color: 'var(--herr-ink-soft)', lineHeight: 1.65, marginBottom: 24, maxWidth: 540 }}>
          Posts a HERR Nation announcement and drops a thread in the
          Beta Testers Lab so every Founding Tester sees what changed
          and how to re-test.
        </p>
        <AnnounceFixForm defaultDeployVersion={deployVersion} />
      </div>
    </main>
  );
}
