import type { Metadata } from 'next';
import Link from 'next/link';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Member Login — HERR',
  description: 'Access your HERR member dashboard.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect ?? '/dashboard';
  const errorType = params.error;

  return (
    <main className="min-h-screen flex flex-col">
      <div className="px-6 pt-8">
        <Link href="/" className="font-display text-xl tracking-[0.2em] text-[var(--herr-white)]">
          HERR™
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="w-full max-w-sm">
          <p className="herr-label text-[var(--herr-pink)] mb-4 text-center">Member Access</p>
          <h1 className="font-display text-4xl md:text-5xl font-light text-[var(--herr-white)] text-center mb-3 leading-tight">
            Welcome back.
          </h1>
          <p className="text-[var(--herr-muted)] text-center mb-10 leading-relaxed">
            Log in to access your HERR dashboard.
          </p>

          {errorType === 'link_expired' && (
            <div className="mb-6 p-4 border border-[var(--herr-pink)] bg-[var(--herr-surface)]">
              <p className="text-[0.8rem] text-[var(--herr-pink)]">
                That login link has expired. Please log in with your password.
              </p>
            </div>
          )}

          <LoginForm redirectTo={redirectTo} />

          <div className="mt-10 pt-8 border-t border-[var(--herr-border)] text-center space-y-3">
            <p className="text-[0.75rem] text-[var(--herr-muted)]">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[var(--herr-white)] hover:text-[var(--herr-cobalt)] transition-colors">
                Create account
              </Link>
            </p>
            <p className="text-[0.75rem] text-[var(--herr-muted)]">
              Not a member yet?{' '}
              <Link href="/checkout" className="text-[var(--herr-white)] hover:text-[var(--herr-cobalt)] transition-colors">
                Begin your reprogramming
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
