import type { Metadata } from 'next';
import Link from 'next/link';
import ScrollFadeIn from '@/components/home/ScrollFadeIn';
import { JsonLd } from '@/components/seo/JsonLd';
import CrisisResource from '@/components/ui/CrisisResource';

export const metadata: Metadata = {
  title: 'The Science Behind HERR',
  description:
    'Clinically informed. Grounded in existential psychology. Understand the frameworks, the voice mechanism, and the regulate-then-reprogram protocol behind HERR.',
};

export default function TheSciencePage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0A0A0F' }}>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What is HERR?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'HERR (Human Existential Response and Reprogramming) is a clinical wellness operating system that delivers personalized voice affirmations in your own cloned voice, founded by Bianca D. McCall, LMFT.',
              },
            },
            {
              '@type': 'Question',
              name: 'How does voice cloning work in HERR?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'HERR clones your voice using AI technology and delivers daily affirmations spoken in your own voice. Self-referential processing research shows the subconscious trusts your own voice above all others.',
              },
            },
            {
              '@type': 'Question',
              name: 'Is HERR a therapy app?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'HERR is a wellness platform, not a healthcare provider or therapy replacement. It is informed by existential psychology and clinical frameworks but is not a substitute for licensed clinical care.',
              },
            },
          ],
        }}
      />

      {/* ── Hero (dark) ────────────────────────────────────────────── */}
      <section
        style={{
          background: '#0A0A0F',
          padding: 'clamp(80px, 12vw, 120px) 24px clamp(48px, 8vw, 80px)',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 600,
            color: '#FFFFFF',
            marginBottom: 16,
            lineHeight: 1.15,
          }}
        >
          The Science Behind HERR
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.6)' }}>
          Clinically informed. Grounded in existential psychology.
        </p>
      </section>

      {/* ── Section 1: What Does It Mean To Be Clinically-Informed? (warm) ── */}
      <section style={{ background: '#FAF8F5', padding: 'clamp(64px, 10vw, 100px) 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <ScrollFadeIn>
            <p
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '2.5px',
                color: '#C42D8E',
                marginBottom: 16,
              }}
            >
              THE FOUNDATION
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(28px, 3.5vw, 32px)',
                fontWeight: 600,
                color: '#1A1A2E',
                marginBottom: 28,
                lineHeight: 1.3,
              }}
            >
              What Does It Mean To Be Clinically-Informed?
            </h2>
          </ScrollFadeIn>
          <ScrollFadeIn delay={100}>
            <p style={{ fontSize: '1.125rem', color: '#1A1A2E', lineHeight: 1.75, marginBottom: 20 }}>
              Clinically informed means the product was designed by a licensed clinical professional using established therapeutic frameworks, evidence-based approaches, and trauma-informed care principles. Every element of HERR, from the existential assessment to the affirmation scripts to the activity-mode delivery system, was built with clinical expertise and ethical standards at the foundation.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={200}>
            <p style={{ fontSize: '1.125rem', color: '#1A1A2E', lineHeight: 1.75, marginBottom: 20 }}>
              This does not mean HERR is a clinical treatment or a replacement for therapy. It means that the methodology, the language, the sequencing, and the safeguards were informed by years of clinical practice and professional training. The distinction matters: HERR is a wellness tool designed with clinical rigor, not a medical device making clinical claims.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={300}>
            <p style={{ fontSize: '1.125rem', color: '#1A1A2E', lineHeight: 1.75 }}>
              The creator, <span style={{ fontWeight: 600 }}>Bianca D. McCall, LMFT</span>, brought her background in systems therapies, existential psychology, and trauma-informed care to every design decision. The result is a product that respects the complexity of the human experience while remaining accessible to anyone seeking to take command of their inner voice.
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ── Section 2: What Is Existential Psychology? (dark) ────────── */}
      <section style={{ background: '#0A0A0F', padding: 'clamp(64px, 10vw, 100px) 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <ScrollFadeIn>
            <p
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '2.5px',
                color: '#C42D8E',
                marginBottom: 16,
              }}
            >
              THE FRAMEWORK
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(28px, 3.5vw, 32px)',
                fontWeight: 600,
                color: '#FFFFFF',
                marginBottom: 28,
                lineHeight: 1.3,
              }}
            >
              What Is Existential Psychology?
            </h2>
          </ScrollFadeIn>
          <ScrollFadeIn delay={100}>
            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.75, marginBottom: 20 }}>
              Existential psychology is a clinical and philosophical framework focused on the core concerns of human existence: meaning, purpose, identity, freedom, isolation, mortality, and the inner voice. Rather than treating symptoms in isolation, existential psychology examines how these fundamental concerns shape every aspect of a person&apos;s life, from their relationships to their performance to their sense of self.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={200}>
            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.75, marginBottom: 20 }}>
              Its roots trace through existential-humanistic psychology, Viktor Frankl&apos;s logotherapy (the search for meaning as the primary motivational force), and existential positive psychology, which bridges the existential tradition with strengths-based approaches to well-being. These are not fringe theories. They are established frameworks taught in graduate clinical programs and applied in therapeutic settings worldwide.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={300}>
            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.75 }}>
              HERR applies these frameworks to everyday performance and wellness, not just crisis intervention. The existential concerns that shape an elite athlete&apos;s performance under pressure are the same concerns that shape a parent&apos;s experience of identity transition, a student&apos;s navigation of purpose, or a professional&apos;s confrontation with burnout. HERR meets people where they are.
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ── Section 3: Why Does The Inner Voice Matter? (warm) ────── */}
      <section style={{ background: '#FAF8F5', padding: 'clamp(64px, 10vw, 100px) 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <ScrollFadeIn>
            <p
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '2.5px',
                color: '#C42D8E',
                marginBottom: 16,
              }}
            >
              THE INNER VOICE
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(28px, 3.5vw, 32px)',
                fontWeight: 600,
                color: '#1A1A2E',
                marginBottom: 28,
                lineHeight: 1.3,
              }}
            >
              Why Does The Inner Voice Matter?
            </h2>
          </ScrollFadeIn>
          <ScrollFadeIn delay={100}>
            <p style={{ fontSize: '1.125rem', color: '#1A1A2E', lineHeight: 1.75, marginBottom: 20 }}>
              The inner voice is the conductor of every performance. It existed before consciousness, was shaped by significant separation events beginning with birth, and was programmed by the significant adults who assigned language to our filters for interpreting life. Before you had the words to question it, your inner voice was already telling you who you are, what you deserve, and what is possible.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={200}>
            <p style={{ fontSize: '1.125rem', color: '#1A1A2E', lineHeight: 1.75, marginBottom: 20 }}>
              When that conductor is dysregulated, every performance suffers: at work, in relationships, in health, in every domain. The person who cannot perform under pressure, the partner who cannot show up fully, the professional who self-sabotages at the threshold of success, these are not failures of character. They are symptoms of a dysregulated inner voice running outdated programming.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={300}>
            <p style={{ fontSize: '1.125rem', color: '#1A1A2E', lineHeight: 1.75 }}>
              HERR was built on the understanding that the inner voice can be reprogrammed. Not through willpower, not through positive thinking, but through a deliberate, clinically informed process that first calms the system, then installs new programming in the most trusted voice available: your own.
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ── Section 4: How Does HERR Regulate The Inner Voice? (dark) ── */}
      <section style={{ background: '#0A0A0F', padding: 'clamp(64px, 10vw, 100px) 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <ScrollFadeIn>
            <p
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '2.5px',
                color: '#C42D8E',
                marginBottom: 16,
              }}
            >
              REGULATE
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(28px, 3.5vw, 32px)',
                fontWeight: 600,
                color: '#FFFFFF',
                marginBottom: 28,
                lineHeight: 1.3,
              }}
            >
              How Does HERR Regulate The Inner Voice?
            </h2>
          </ScrollFadeIn>
          <ScrollFadeIn delay={100}>
            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.75, marginBottom: 20 }}>
              Regulation comes first because a dysregulated nervous system cannot receive new programming. Affirmations delivered to a body that believes it is under threat are processed as noise. HERR&apos;s sequence is clinically intentional: calm the system before attempting to change it.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={200}>
            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.75, marginBottom: 20 }}>
              HERR regulates through personalized voice affirmations, sound therapy frequencies, and activity-mode delivery calibrated to the user&apos;s existential screener results. Each mode is designed for a specific state of being, whether the user needs grounding during a high-stress workday, centering before sleep, or activation before a performance.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={300}>
            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.75 }}>
              HERR uses the user&apos;s own cloned voice because research in auditory neuroscience shows that self-referential processing activates distinct neural pathways compared to hearing another person speak. Your own voice bypasses the skepticism filters that block generic recordings. The mechanism depends on it.
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ── Section 5: How Does HERR Reprogram The Inner Voice? (warm) ── */}
      <section style={{ background: '#FAF8F5', padding: 'clamp(64px, 10vw, 100px) 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <ScrollFadeIn>
            <p
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '2.5px',
                color: '#C42D8E',
                marginBottom: 16,
              }}
            >
              REPROGRAM
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(28px, 3.5vw, 32px)',
                fontWeight: 600,
                color: '#1A1A2E',
                marginBottom: 28,
                lineHeight: 1.3,
              }}
            >
              How Does HERR Reprogram The Inner Voice?
            </h2>
          </ScrollFadeIn>
          <ScrollFadeIn delay={100}>
            <p style={{ fontSize: '1.125rem', color: '#1A1A2E', lineHeight: 1.75, marginBottom: 20 }}>
              Once regulated, HERR delivers I AM declarations in the user&apos;s own cloned voice to install new identity programming at the subconscious level. These are not generic motivational affirmations. Each script is generated based on the specific existential concerns identified in the ECQO assessment, targeting the precise areas where the user&apos;s inner voice is running outdated or harmful programming.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={200}>
            <p style={{ fontSize: '1.125rem', color: '#1A1A2E', lineHeight: 1.75, marginBottom: 20 }}>
              This is not positive thinking. It is deliberate cognitive restructuring using the most trusted voice available: your own. The grammatical structure of I AM declarations activates deeper self-schema processing than generic motivational statements. You are not being told you can. You are being reminded of who you are already becoming.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={300}>
            <p style={{ fontSize: '1.125rem', color: '#1A1A2E', lineHeight: 1.75 }}>
              Over time, these declarations create measurable shifts in how the user experiences their core existential concerns. Monthly reassessment through the ECQO screener tracks this progression, adjusting scripts as the user evolves. The result is not a one-time intervention but a sustained reprogramming protocol that adapts to the user&apos;s transformation.
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ── Section 6: Is HERR Clinically Validated? (dark) ──────────── */}
      <section style={{ background: '#0A0A0F', padding: 'clamp(64px, 10vw, 100px) 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <ScrollFadeIn>
            <p
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '2.5px',
                color: '#C42D8E',
                marginBottom: 16,
              }}
            >
              VALIDATION
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(28px, 3.5vw, 32px)',
                fontWeight: 600,
                color: '#FFFFFF',
                marginBottom: 28,
                lineHeight: 1.3,
              }}
            >
              Is HERR Clinically Validated?
            </h2>
          </ScrollFadeIn>
          <ScrollFadeIn delay={100}>
            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.75 }}>
              HERR is grounded in established clinical frameworks including Value Assessment of the Core Existential Concerns, Existential-Humanistic Psychology, Logotherapy, Existential Positive Psychology, and Phenological Approach. HERR is a wellness tool, not a clinical treatment, and has not undergone independent clinical trials. It was designed by a licensed clinical professional with expertise in systems therapies and existential psychology.
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ── Bottom CTA + Disclaimer (dark) ─────────────────────────── */}
      <section
        style={{
          background: '#111118',
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <Link
          href="/checkout"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 48,
            padding: '0 40px',
            background: '#C42D8E',
            color: '#FFFFFF',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textDecoration: 'none',
          }}
        >
          Experience the Science
        </Link>
        <p
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.35)',
            maxWidth: 600,
            margin: '40px auto 0',
            lineHeight: 1.6,
          }}
        >
          HERR is a wellness technology platform. It is not a medical device and is not intended to
          diagnose, treat, cure, or prevent any disease or mental health condition. If you are
          experiencing a mental health crisis, please contact{' '}
          <a href="tel:988" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>
            988
          </a>{' '}
          or your local emergency services.
        </p>
      </section>

      <CrisisResource variant="light" />
    </main>
  );
}
