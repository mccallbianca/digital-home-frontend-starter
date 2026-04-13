import type { Metadata } from 'next';
import Link from 'next/link';
import UpdatePasswordForm from './UpdatePasswordForm';

export const metadata: Metadata = {
  title: 'Set New Password | HERR',
  description: 'Set a new password for your HERR account.',
};

export default function UpdatePasswordPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="px-6 pt-8">
        <Link href="/" className="font-display text-xl tracking-[0.2em] text-[var(--herr-white)]">
          HERR™
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="w-full max-w-sm">
          <p className="herr-label text-[var(--herr-cobalt)] mb-4 text-center">Password Reset</p>
          <h1 className="font-display text-4xl md:text-5xl font-light text-[var(--herr-white)] text-center mb-3 leading-tight">
            Set your new password.
          </h1>
          <p className="text-[var(--herr-muted)] text-center mb-10 leading-relaxed">
            Choose a strong password for your HERR account.
          </p>

          <UpdatePasswordForm />
        </div>
      </div>
    </main>
  );
}
