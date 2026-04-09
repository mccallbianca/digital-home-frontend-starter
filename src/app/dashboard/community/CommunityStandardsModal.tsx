'use client';

import { useState } from 'react';

interface CommunityStandardsModalProps {
  onAccept: () => void;
}

export default function CommunityStandardsModal({ onAccept }: CommunityStandardsModalProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="bg-[var(--herr-black)] border border-[var(--herr-border)] max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8">
        <p className="herr-label text-[var(--herr-cobalt)] mb-4">Before You Enter</p>
        <h2 className="font-display text-3xl font-light text-[var(--herr-white)] mb-6">
          HERR Nation<br />
          <span className="text-[var(--herr-pink)]">Community Standards.</span>
        </h2>

        <div className="space-y-6 text-[0.88rem] text-[var(--herr-muted)] leading-relaxed">
          {/* 988 Crisis Block — persistent */}
          <div className="bg-[#1a0a12] border border-[var(--herr-pink)] p-5">
            <p className="herr-label text-[var(--herr-pink)] mb-2">If You Are in Crisis</p>
            <p>
              If you or someone you know is in immediate danger, please contact the{' '}
              <strong className="text-[var(--herr-white)]">988 Suicide & Crisis Lifeline</strong>{' '}
              by calling or texting <strong className="text-[var(--herr-white)]">988</strong>.
            </p>
            <p className="mt-2">
              HERR Nation is a peer community, not a crisis service. Our moderators are not licensed
              to provide emergency support. Always reach a trained crisis counselor first.
            </p>
          </div>

          <div>
            <h3 className="text-[var(--herr-white)] font-medium mb-2">1. Respect Every Version of HERR</h3>
            <p>
              This is a space for every human doing the reprogramming work. Treat every member with
              the dignity and respect you would expect for yourself. No exceptions.
            </p>
          </div>

          <div>
            <h3 className="text-[var(--herr-white)] font-medium mb-2">2. Anti-Discrimination</h3>
            <p>
              Discrimination based on race, ethnicity, gender identity, sexual orientation, religion,
              disability, age, or socioeconomic status will not be tolerated. HERR is for everyone
              doing the work.
            </p>
          </div>

          <div>
            <h3 className="text-[var(--herr-white)] font-medium mb-2">3. Anti-Harassment</h3>
            <p>
              Harassment, bullying, intimidation, doxxing, or unwanted contact — in threads or DMs —
              is grounds for immediate removal. If someone asks you to stop, stop.
            </p>
          </div>

          <div>
            <h3 className="text-[var(--herr-white)] font-medium mb-2">4. No Clinical Advice</h3>
            <p>
              Do not diagnose, prescribe, or offer clinical advice. Share your experience, not your
              expertise on someone else&apos;s situation. The HERR protocol is facilitated by a licensed
              clinician — peer discussion is not a substitute.
            </p>
          </div>

          <div>
            <h3 className="text-[var(--herr-white)] font-medium mb-2">5. Confidentiality</h3>
            <p>
              What is shared in HERR Nation stays in HERR Nation. Do not screenshot, share, or
              reference another member&apos;s posts or DMs outside this community.
            </p>
          </div>

          <div>
            <h3 className="text-[var(--herr-white)] font-medium mb-2">6. Safety & Moderation</h3>
            <p>
              HERR-Certified Moderators review flagged content daily. You can silence a member
              (hide their posts from your feed), block a member (prevent DMs), or pause your
              community access at any time. Use the flag button on any post that violates
              these standards.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--herr-border)] pt-6">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-1 accent-[var(--herr-pink)]"
            />
            <span className="text-[0.85rem] text-[var(--herr-muted)] group-hover:text-[var(--herr-white)] transition-colors">
              I have read and agree to the HERR Nation Community Standards. I understand this is a
              peer community, not a crisis service, and I will contact 988 if I or someone I know
              is in immediate danger.
            </span>
          </label>

          <button
            onClick={onAccept}
            disabled={!agreed}
            className="btn-herr-primary mt-6 w-full disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Enter HERR Nation
          </button>
        </div>
      </div>
    </div>
  );
}
