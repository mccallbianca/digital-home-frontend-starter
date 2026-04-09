'use client';

/**
 * DashboardClient — Client-side wrapper for Dashboard
 * =====================================================
 * Handles:
 * - "Navigating HERR" first-load tutorial
 * - Client-side interactivity for the dashboard cards
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavigatingHERR from './NavigatingHERR';

interface DashboardCard {
  href: string;
  label: string;
  description: string;
  tier: string;
  tierColor: string;
  status: string | null;
  statusColor: string;
  accessible: boolean;
  locked?: boolean;
  sectionId: string;
  icon: React.ReactNode;
}

interface DashboardClientProps {
  userId: string;
  displayName: string;
  plan: string | null;
  cards: DashboardCard[];
  isFirstLoad: boolean;
}

export default function DashboardClient({
  userId,
  displayName,
  plan,
  cards,
  isFirstLoad,
}: DashboardClientProps) {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Check if tutorial has been completed
    const tutorialDone = localStorage.getItem(`herr_tutorial_complete_${userId}`);
    if (isFirstLoad && !tutorialDone) {
      // Small delay so the dashboard renders first
      const timer = setTimeout(() => setShowTutorial(true), 800);
      return () => clearTimeout(timer);
    }
  }, [userId, isFirstLoad]);

  return (
    <>
      {/* Tutorial overlay */}
      {showTutorial && (
        <NavigatingHERR
          userId={userId}
          onComplete={() => setShowTutorial(false)}
        />
      )}

      <main className="min-h-screen">
        {/* Header */}
        <section className="px-6 pt-32 pb-16 border-b border-[var(--herr-border)]">
          <div className="max-w-[1200px] mx-auto">
            <p className="herr-label text-[var(--herr-muted)] mb-4">Member Dashboard</p>
            <h1 className="font-display text-4xl md:text-6xl font-light text-[var(--herr-white)] leading-[0.9] mb-4">
              Welcome back, {displayName}.
            </h1>
            {plan && (
              <p className="herr-label mt-6" style={{
                color: plan === 'elite' ? 'var(--herr-cobalt)' :
                       plan === 'personalized' ? 'var(--herr-pink)' : 'var(--herr-muted)'
              }}>
                {plan === 'elite' ? 'HERR Elite' :
                 plan === 'personalized' ? 'HERR Personalized' : 'HERR Collective'}
              </p>
            )}
          </div>
        </section>

        {/* Feature cards — 5-section grid */}
        <section className="px-6 py-16">
          <div className="max-w-[1200px] mx-auto">
            {/* Top row: Inbox + Progress (larger cards) */}
            <div className="grid md:grid-cols-2 gap-px bg-[var(--herr-border)] mb-px">
              {cards.slice(0, 2).map((card) => (
                <DashboardCardComponent key={card.sectionId} card={card} featured />
              ))}
            </div>

            {/* Bottom row: Live Events + Community + Profile */}
            <div className="grid md:grid-cols-3 gap-px bg-[var(--herr-border)]">
              {cards.slice(2).map((card) => (
                <DashboardCardComponent key={card.sectionId} card={card} />
              ))}
            </div>
          </div>
        </section>

        {/* Re-access tutorial link */}
        <section className="px-6 pb-8">
          <div className="max-w-[1200px] mx-auto flex items-center gap-6">
            <button
              onClick={() => {
                localStorage.removeItem(`herr_tutorial_complete_${userId}`);
                setShowTutorial(true);
              }}
              className="text-[0.72rem] text-[var(--herr-faint)] hover:text-[var(--herr-muted)] transition-colors uppercase tracking-widest"
            >
              Replay &ldquo;Navigating HERR&rdquo; Tutorial
            </button>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="px-6 pb-16">
          <div className="max-w-[1200px] mx-auto">
            <p className="text-[0.72rem] text-[var(--herr-faint)] leading-relaxed">
              HERR is a wellness tool and is not a substitute for professional mental health treatment.
              Always consult a licensed clinician for clinical concerns. &copy; ECQO Holdings.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

// ── Individual Card Component ───────────────────────────────
function DashboardCardComponent({
  card,
  featured = false,
}: {
  card: DashboardCard;
  featured?: boolean;
}) {
  return (
    <Link
      href={card.href}
      className={`bg-[var(--herr-black)] transition-colors duration-300 flex flex-col gap-3 group hover:bg-[var(--herr-surface)] ${
        featured ? 'p-10' : 'p-8'
      }`}
    >
      {/* Icon */}
      <div className="mb-2 text-[var(--herr-faint)] group-hover:text-[var(--herr-pink)] transition-colors">
        {card.icon}
      </div>

      <p className={`herr-label ${card.tierColor}`}>{card.tier}</p>
      <h2
        className={`font-display font-light text-[var(--herr-white)] group-hover:text-[var(--herr-pink)] transition-colors duration-300 ${
          featured ? 'text-3xl' : 'text-2xl'
        }`}
      >
        {card.label}
      </h2>
      <p className="text-[0.85rem] text-[var(--herr-muted)] leading-relaxed">
        {card.description}
      </p>
      {card.status && (
        <p className={`text-[0.75rem] ${card.statusColor} mt-auto pt-2`}>
          {card.status}
        </p>
      )}
      {card.locked && (
        <p className="text-[0.75rem] text-[var(--herr-cobalt)] mt-auto pt-2">
          Upgrade to HERR Elite &rarr;
        </p>
      )}
    </Link>
  );
}
