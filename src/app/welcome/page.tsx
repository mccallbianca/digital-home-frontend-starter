import type { Metadata } from 'next';
import Link from 'next/link';
import Stripe from 'stripe';

export const metadata: Metadata = {
  title: 'Welcome — Your Reprogramming Begins Now',
  description:
    'You have taken the first step. Welcome to HERR — clinical wellness built by Bianca D. McCall, LMFT.',
};

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  let memberEmail = '';
  let verified = false;

  // ── Verify Stripe session and get email ─────────────────────────────
  if (session_id) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2026-03-25.dahlia',
        httpClient: Stripe.createFetchHttpClient(),
      });
      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (session.payment_status === 'paid' || session.status === 'complete') {
        verified = true;
        memberEmail = session.customer_details?.email ?? session.customer_email ?? '';

        // Trigger welcome email via internal API
        if (memberEmail) {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.h3rr.com';
          try {
            await fetch(`${siteUrl}/api/send-welcome`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: memberEmail,
                name: session.customer_details?.name ?? '',
                tier: session.metadata?.tier ?? '',
              }),
            });
          } catch (emailErr) {
            console.error('[welcome] Email trigger error:', emailErr);
          }
        }
      }
    } catch (err) {
      console.error('[welcome] Stripe session fetch error:', err);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-lg w-full text-center">

        {verified ? (
          <>
            <p className="herr-label text-[var(--herr-cobalt)] mb-6">Payment Confirmed</p>

            <h1 className="font-display text-5xl md:text-6xl font-light text-[var(--herr-white)] leading-[0.9] mb-6">
              You&apos;re in.
            </h1>

            <p className="text-xl text-[var(--herr-muted)] mb-10 leading-relaxed">
              Check your email.
            </p>

            {/* Email confirmation box */}
            <div className="bg-[var(--herr-surface)] border border-[var(--herr-cobalt)] p-8 mb-8 text-left">
              <p className="herr-label text-[var(--herr-cobalt)] mb-4">Confirmation Sent</p>
              <p className="text-[var(--herr-white)] text-lg mb-2">
                We&apos;ve sent a confirmation link to:
              </p>
              <p className="font-display text-2xl text-[var(--herr-pink)] mb-4">
                {memberEmail}
              </p>
              <p className="text-[var(--herr-muted)] text-sm leading-relaxed">
                Click it to set up your account. Check your spam folder if you don&apos;t see it within a few minutes.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/login" className="btn-herr-ghost">
                Didn&apos;t get the email? Login here
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="font-display text-4xl font-light text-[var(--herr-white)] mb-4">
              Session not found.
            </h1>
            <p className="text-[var(--herr-muted)] mb-8 leading-relaxed">
              We couldn&apos;t verify your payment session. If you just subscribed, check your email for a login link.
            </p>
            <Link href="/checkout" className="btn-herr-primary">
              Return to Checkout
            </Link>
          </>
        )}

        <p className="mt-12 text-[0.72rem] text-[var(--herr-faint)] leading-relaxed">
          HERR™ is a wellness tool and is not a substitute for professional mental health treatment.
          Always consult a licensed clinician for clinical concerns. © ECQO Holdings.
        </p>
      </div>
    </main>
  );
}
