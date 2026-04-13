import type { Metadata } from 'next';
import ResetPasswordClient from './ResetPasswordClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Set New Password | HERR',
  description: 'Set a new password for your HERR account.',
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
