import type { Metadata } from 'next';
import Link from 'next/link';
import SignupForm from './SignupForm';

export const metadata: Metadata = {
  title: 'Create Account — HERR',
  description: 'Set up your HERR member account.',
};

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="px-6 pt-8">
        <Link href="/" className="font-display text-xl tracking-[0.2em] text-[var(--herr-white)]">
          HERR™
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="w-full max-w-sm">
          <p className="herr-label text-[var(--herr-pink)] mb-4 text-center">Create Account</p>
          <h1 className="font-display text-4xl md:text-5xl font-light text-[var(--herr-white)] text-center mb-3 leading-tight">
            Set up your account.
          </h1>
          <p className="text-[var(--herr-muted)] text-center mb-10 leading-relaxed">
            Create your password to access your HERR dashboard.
          </p>

          <SignupForm />

          <div className="mt-10 pt-8 border-t border-[var(--herr-border)] text-center">
            <p className="text-[0.75rem] text-[var(--herr-muted)]">
              Already have an account?{' '}
              <Link href="/login" className="text-[var(--herr-white)] hover:text-[var(--herr-cobalt)] transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
