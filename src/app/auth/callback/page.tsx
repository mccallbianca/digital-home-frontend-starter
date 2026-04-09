'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';

function Spinner() {
  return (
    <div className="w-8 h-8 border-2 border-[var(--herr-cobalt)] border-t-transparent rounded-full animate-spin" />
  );
}

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status] = useState('Signing you in…');

  useEffect(() => {
    const supabase = createClient();
    const next = searchParams.get('next') ?? '/dashboard';

    async function handleCallback() {
      try {
        // ── Check for hash tokens in the URL (implicit flow) ─────────
        // These arrive as #access_token=...&refresh_token=...
        const hash = window.location.hash;
        if (hash && hash.includes('access_token=')) {
          // Parse tokens from hash
          const params = new URLSearchParams(hash.replace('#', ''));
          const accessToken  = params.get('access_token') ?? '';
          const refreshToken = params.get('refresh_token') ?? '';

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token:  accessToken,
              refresh_token: refreshToken,
            });
            if (error) {
              console.error('[auth/callback] setSession error:', error.message);
              router.replace('/login?error=link_expired');
              return;
            }
            // Clear hash from URL then navigate
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
            router.replace(next);
            return;
          }
        }

        // ── PKCE flow: ?code=... ──────────────────────────────────────
        const code = searchParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('[auth/callback] PKCE error:', error.message);
            router.replace('/login?error=link_expired');
            return;
          }
          router.replace(next);
          return;
        }

        // ── No token found ────────────────────────────────────────────
        console.error('[auth/callback] No token found');
        router.replace('/login?error=link_expired');

      } catch (err) {
        console.error('[auth/callback] Unexpected error:', err);
        router.replace('/login?error=link_expired');
      }
    }

    handleCallback();
  }, [router, searchParams]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-6">
      <p className="font-display text-2xl font-light text-[var(--herr-white)]">{status}</p>
      <Spinner />
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex flex-col items-center justify-center gap-6">
          <p className="font-display text-2xl font-light text-[var(--herr-white)]">Signing you in…</p>
          <Spinner />
        </main>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
