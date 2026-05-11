import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin | HERR' };

// Auth gate and AdminNav rendering live in src/app/(operator)/layout.tsx now.
// This inner layout is a pass-through to keep the metadata segmented.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
