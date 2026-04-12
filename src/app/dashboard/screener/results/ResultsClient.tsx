'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DomainScore {
  domain: string;
  avg: number;
}

interface Snapshot {
  month: number;
  year: number;
  responses: Record<string, number>;
}

interface ResultsClientProps {
  overallAvg: number;
  scores: DomainScore[];
  hasModes: boolean;
  snapshots: Snapshot[];
}

function getOverallLabel(score: number): string {
  if (score <= 2.0) return 'Grounded — Your inner landscape is stable.';
  if (score <= 3.0) return 'Emerging — Awareness is surfacing.';
  if (score <= 4.0) return 'Active — Significant existential themes are present.';
  return 'Elevated — Deep existential work is indicated.';
}

function getDomainInterpretation(score: number): string {
  if (score <= 2.0) return 'This domain feels stable for you right now.';
  if (score <= 3.5) return 'Emerging awareness. HERR will address this in your affirmations.';
  return 'A primary area for reprogramming. Your daily affirmations will focus here.';
}

const DOMAIN_LABELS: Record<string, string> = {
  meaning: 'MEANING',
  identity: 'IDENTITY',
  freedom: 'FREEDOM',
  isolation: 'ISOLATION',
  mortality: 'MORTALITY',
};

export default function ResultsClient({ overallAvg, scores, hasModes, snapshots }: ResultsClientProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0A0F',
        padding: '80px 24px 60px',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <p
          style={{
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#C42D8E',
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          YOUR RESULTS
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 28,
            fontWeight: 600,
            color: '#FFFFFF',
            textAlign: 'center',
            marginBottom: 4,
          }}
        >
          ECQO Assessment — {dateStr}
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            marginBottom: 32,
          }}
        >
          Your existential landscape, quantified.
        </p>

        {/* Overall score */}
        <div
          style={{
            background: '#16161F',
            borderRadius: 16,
            padding: 40,
            border: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'center',
            marginBottom: 32,
          }}
        >
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 64,
              fontWeight: 600,
              color: '#FFFFFF',
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            {overallAvg.toFixed(1)}{' '}
            <span style={{ fontSize: 24, color: 'rgba(255,255,255,0.4)' }}>/ 5.0</span>
          </p>
          <p style={{ fontSize: 16, color: '#E8388A', marginBottom: 16 }}>
            {getOverallLabel(overallAvg)}
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: 520, margin: '0 auto' }}>
            This score reflects the average intensity of existential concerns across all five
            domains. Higher scores indicate areas where HERR&apos;s reprogramming can have the greatest impact.
          </p>
        </div>

        {/* Domain breakdown */}
        <div className="domain-grid">
          {scores.map((s, i) => (
            <div
              key={s.domain}
              style={{
                background: '#16161F',
                borderRadius: 16,
                padding: 24,
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: 12,
                }}
              >
                {DOMAIN_LABELS[s.domain] || s.domain}
              </p>
              {/* Score bar */}
              <div
                style={{
                  width: '100%',
                  height: 8,
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: 4,
                  overflow: 'hidden',
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    background: '#C42D8E',
                    borderRadius: 4,
                    width: animated ? `${(s.avg / 5) * 100}%` : '0%',
                    transition: `width 800ms ease ${i * 100}ms`,
                  }}
                />
              </div>
              <p style={{ fontSize: 16, color: '#FFFFFF', marginBottom: 4 }}>
                {s.avg.toFixed(1)} / 5.0
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                {getDomainInterpretation(s.avg)}
              </p>
            </div>
          ))}
        </div>

        {/* What happens next */}
        <div
          style={{
            background: '#111118',
            borderRadius: 16,
            padding: 32,
            marginTop: 32,
          }}
        >
          <p
            style={{
              fontSize: 20,
              color: '#FFFFFF',
              marginBottom: 24,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
            }}
          >
            What happens with your results?
          </p>
          {[
            'Your top existential concerns have been identified and will shape your daily affirmation scripts.',
            'HERR\u2019s AI generates personalized I AM declarations targeting your specific domains.',
            'These affirmations are delivered daily \u2014 in your voice (Personalized/Elite) or Bianca\u2019s voice (Collective) \u2014 calibrated to your activity mode.',
          ].map((text, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, marginBottom: i < 2 ? 20 : 0 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#C42D8E',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                {text}
              </p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            marginTop: 40,
            flexWrap: 'wrap',
          }}
        >
          <Link
            href={hasModes ? '/dashboard/affirmations' : '/dashboard/modes'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 48,
              padding: '0 32px',
              background: '#C42D8E',
              color: '#FFFFFF',
              borderRadius: 12,
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              textDecoration: 'none',
            }}
          >
            {hasModes ? 'Go to My Affirmations' : 'Choose Your Activity Modes'}
          </Link>
          <Link
            href="/dashboard/screener"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 48,
              padding: '0 32px',
              background: 'transparent',
              color: '#FFFFFF',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.3)',
              fontSize: 14,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              textDecoration: 'none',
            }}
          >
            Retake Assessment
          </Link>
        </div>

        <p
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.35)',
            textAlign: 'center',
            marginTop: 24,
          }}
        >
          You can retake this assessment monthly. Your affirmation scripts update
          automatically based on your latest results.
        </p>

        {/* Historical results */}
        {snapshots.length > 0 && (
          <div style={{ marginTop: 48, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 32 }}>
            <p
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: 16,
              }}
            >
              PREVIOUS ASSESSMENTS
            </p>
            {snapshots.map((snap, i) => {
              const date = new Date(snap.year, snap.month - 1);
              const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              const vals = Object.values(snap.responses);
              const avg = vals.length > 0
                ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
                : '—';
              return (
                <div
                  key={i}
                  style={{
                    background: '#16161F',
                    borderRadius: 12,
                    padding: '16px 24px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <p style={{ fontSize: 14, color: '#FFFFFF' }}>{label}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 80,
                        height: 4,
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          background: '#C42D8E',
                          borderRadius: 2,
                          width: `${(parseFloat(String(avg)) / 5) * 100}%`,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>{avg} / 5.0</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Disclaimer */}
        <p
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.35)',
            textAlign: 'center',
            marginTop: 32,
            lineHeight: 1.6,
          }}
        >
          This assessment is a wellness tool and does not constitute a clinical diagnosis.
          If your results concern you, please consult a licensed mental health professional.
          If you are in crisis, call or text{' '}
          <a href="tel:988" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>988</a>.
        </p>
      </div>

      <style>{`
        .domain-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }
        @media (max-width: 768px) {
          .domain-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
