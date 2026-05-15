'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import JourneyPostCreator from '@/components/JourneyPostCreator';

interface ShareReflectionCTAProps {
  userId: string;
  canPost: boolean;
}

export default function ShareReflectionCTA({ userId, canPost }: ShareReflectionCTAProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!canPost) {
    return (
      <a
        href="/dashboard/billing"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 48,
          padding: '0 32px',
          background: '#E8388A',
          color: '#FFFFFF',
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          textDecoration: 'none',
        }}
      >
        Unlock Posting — Upgrade Plan
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 48,
          padding: '0 32px',
          background: '#E8388A',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          cursor: 'pointer',
        }}
      >
        Share Your First Reflection
      </button>
      <JourneyPostCreator
        userId={userId}
        open={open}
        onClose={() => setOpen(false)}
        onPosted={() => {
          setOpen(false);
          router.push('/dashboard/journey');
        }}
      />
    </>
  );
}
