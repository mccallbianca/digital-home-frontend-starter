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
              name: 'What does it mean to be clinically-informed?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Clinically informed means every element of HERR was designed by a licensed clinical professional using established therapeutic frameworks, evidence-based approaches, and trauma-informed care principles. It does not mean HERR is a clinical treatment or a replacement for therapy.',
              },
            },
            {
              '@type': 'Question',
              name: 'What is existential psychology?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Existential psychology is a clinical and philosophical framework focused on the core concerns of human existence: meaning, purpose, identity, freedom, isolation, and mortality. Its roots include existential-humanistic psychology, logotherapy, and existential positive psychology.',
              },
            },
            {
              '@type': 'Question',
              name: 'Why does the inner voice matter?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'The inner voice is the conductor of every performance. When the conductor is dysregulated, every performance suffers. HERR was built on the clinical insight that transforming the conductor transforms the performance.',
              },
            },
            {
              '@type': 'Question',
              name: 'How does HERR regulate the inner voice?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Regulation comes first because a dysregulated nervous system cannot receive new programming. HERR regulates through personalized voice affirmations delivered in the user\'s own cloned voice, paired with sound therapy frequencies calibrated to each activity mode.',
              },
            },
            {
              '@type': 'Question',
              name: 'How does HERR reprogram the inner voice?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Once regulated, HERR delivers I AM declarations in the user\'s own voice to install new identity programming at the subconscious level. The scripts target specific existential concerns identified in the ECQO assessment, delivered through eight activity modes.',
              },
            },
            {
              '@type': 'Question',
              name: 'Is HERR clinically validated?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'HERR is grounded in established clinical frameworks including Value Assessment of the Core Existential Concerns, Existential-Humanistic Psychology, Logotherapy, Existential Positive Psychology, and Phenological Approach. HERR is a wellness tool, not a clinical treatment, and has not undergone independent clinical trials.',
              },
            },
          ],
        }}
      />

      {/* ── Hero (dark) ────────────────────────────────────────────── */}
      <section
        style={{
          background: '#0A0A0F',
          padding: 'clamp(100px, 14vw, 140px) 24px clamp(60px, 8vw, 80px)',
          textAlign: 'center',
        }}
      >
        <ScrollFadeIn>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(36px, 5vw, 52px)',
              fontWeight: 700,
              color: '#FFFFFF',
              marginBottom: 20,
              lineHeight: 1.15,
            }}
          >
            The Science Behind HERR
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              color: 'rgba(255,255,255,0.55)',
              maxWidth: 640,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Designed by Bianca D. McCall, LMFT | Licensed Marriage and Family Therapist | Federal SAMHSA Advisor
          </p>
        </ScrollFadeIn>
      </section>

      {/* ── Section 1: What Does It Mean To Be Clinically-Informed? (warm) ── */}
      <section style={{ background: '#FAF8F5', padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <ScrollFadeIn>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(28px, 4vw, 36px)',
                fontWeight: 700,
                color: '#1A1A2E',
                marginBottom: 32,
                lineHeight: 1.3,
              }}
            >
              What Does It Mean To Be Clinically-Informed?
            </h2>
          </ScrollFadeIn>
          <ScrollFadeIn delay={100}>
            <p style={{ fontSize: '1.125rem', color: '#1A1A2E', lineHeight: 1.8, marginBottom: 24 }}>
              Clinically informed means every element of HERR, from the existential assessment to the personalized scripts to the eight delivery modes, was designed by a licensed clinical professional using established therapeutic frameworks, evidence-based approaches, and trauma-informed care principles. Every design decision was made with the same rigor, ethical standards, and clinical knowledge that governs licensed practice.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={200}>
            <p style={{ fontSize: '1.125rem', color: '#1A1A2E', lineHeight: 1.8, marginBottom: 24 }}>
              Clinically informed does not mean HERR is a clinical treatment, a medical device, or a replacement for therapy. It means the product was built with clinical expertise at the foundation. The distinction matters: HERR brings clinical expertise to wellness technology without making clinical claims.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={300}>
            <p style={{ fontSize: '1.125rem', color: '#1A1A2E', lineHeight: 1.8 }}>
              The creator, <span style={{ fontWeight: 600 }}>Bianca D. McCall, LMFT</span>, brought her background in systems therapies, existential psychology, and trauma-informed care to every design decision. The result is a product that respects the complexity of the human experience while remaining accessible to anyone seeking to take command of their inner voice.
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ── Section 2: What Is Existential Psychology? (dark) ────────── */}
      <section style={{ background: '#0A0A0F', padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <ScrollFadeIn>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(28px, 4vw, 36px)',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: 32,
                lineHeight: 1.3,
              }}
            >
              What Is Existential Psychology?
            </h2>
          </ScrollFadeIn>
          <ScrollFadeIn delay={100}>
            <p style={{ fontSize: '1.125rem', color: '#FAF8F5', lineHeight: 1.8, marginBottom: 24 }}>
              Existential psychology is a clinical and philosophical framework focused on the core concerns of human existence: meaning, purpose, identity, freedom, isolation, and mortality. Its roots include existential-humanistic psychology, Viktor Frankl&apos;s logotherapy (finding meaning through suffering), and existential positive psychology. These are not fringe theories. They are established frameworks taught in graduate clinical programs and applied in therapeutic settings worldwide.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={200}>
            <p style={{ fontSize: '1.125rem', color: '#FAF8F5', lineHeight: 1.8, marginBottom: 24 }}>
              Unlike symptom-focused approaches, existential psychology works at the level of origin: the fundamental questions that shape how a person interprets their entire life. The fears and questions that emerge at the existential level are not disorders to be managed. They are the signal beneath the signal.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={300}>
            <p style={{ fontSize: '1.125rem', color: '#FAF8F5', lineHeight: 1.8 }}>
              HERR applies these frameworks to everyday performance and wellness. The ECQO assessment maps a user&apos;s relationship to these core existential concerns, creating a personalized foundation that generic wellness tools never reach. The existential concerns that shape an elite athlete&apos;s performance under pressure are the same concerns that shape a parent&apos;s experience of identity transition, a student&apos;s navigation of purpose, or a professional&apos;s confrontation with burnout.
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ── Section 3: Why Does The Inner Voice Matter? (warm) ────── */}
      <section style={{ background: '#FAF8F5', padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <ScrollFadeIn>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(28px, 4vw, 36px)',
                fontWeight: 700,
                color: '#1A1A2E',
                marginBottom: 32,
                lineHeight: 1.3,
              }}
            >
              Why Does The Inner Voice Matter?
            </h2>
          </ScrollFadeIn>
          <ScrollFadeIn delay={100}>
            <p style={{ fontSize: '1.125rem', color: '#1A1A2E', lineHeight: 1.8, marginBottom: 24 }}>
              The inner voice is the conductor of every performance. It existed before conscious thought, shaped by the significant separation event of birth and by the significant adults who assigned language to our filters for interpreting life, death, meaning, purpose, and freedom. Before you had the words to question it, your inner voice was already telling you who you are, what you deserve, and what is possible.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={200}>
            <p style={{ fontSize: '1.125rem', color: '#1A1A2E', lineHeight: 1.8, marginBottom: 24 }}>
              Every decision, every emotional response, every performance, at work, in relationships, in health, in sport, in parenthood, is conducted by this voice. When the conductor is dysregulated, every performance suffers. The person who cannot perform under pressure, the partner who cannot show up fully, the professional who self-sabotages at the threshold of success: these are not failures of character. They are symptoms of a dysregulated inner voice running outdated programming.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={300}>
            <p style={{ fontSize: '1.125rem', color: '#1A1A2E', lineHeight: 1.8 }}>
              The inner voice is not background noise. It is the operating system running beneath every conscious choice. HERR was built on the clinical insight that transforming the conductor transforms the performance.
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ── Section 4: How Does HERR Regulate The Inner Voice? (dark) ── */}
      <section style={{ background: '#0A0A0F', padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <ScrollFadeIn>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(28px, 4vw, 36px)',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: 32,
                lineHeight: 1.3,
              }}
            >
              How Does HERR Regulate The Inner Voice?
            </h2>
          </ScrollFadeIn>
          <ScrollFadeIn delay={100}>
            <p style={{ fontSize: '1.125rem', color: '#FAF8F5', lineHeight: 1.8, marginBottom: 24 }}>
              Regulation comes first because a dysregulated nervous system cannot receive new programming. The autonomic nervous system governs the body&apos;s threat response. When chronically activated, the prefrontal cortex (responsible for rational thought, identity, and behavioral change) goes offline. This is why willpower fails. This is why generic affirmations don&apos;t stick.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={200}>
            <p style={{ fontSize: '1.125rem', color: '#FAF8F5', lineHeight: 1.8, marginBottom: 24 }}>
              HERR regulates through personalized voice affirmations delivered in the user&apos;s own cloned voice, paired with sound therapy frequencies calibrated to each activity mode. Each mode is designed for a specific state of being, whether the user needs grounding during a high-stress workday, centering before sleep, or activation before a performance.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={300}>
            <p style={{ fontSize: '1.125rem', color: '#FAF8F5', lineHeight: 1.8 }}>
              Research in auditory neuroscience confirms that self-referential processing, hearing one&apos;s own voice, activates distinct neural pathways associated with trust and identity. The voice the nervous system trusts most is the one it already knows. Your own voice bypasses the skepticism filters that block generic recordings. The mechanism depends on it.
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ── Section 5: How Does HERR Reprogram The Inner Voice? (warm) ── */}
      <section style={{ background: '#FAF8F5', padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <ScrollFadeIn>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(28px, 4vw, 36px)',
                fontWeight: 700,
                color: '#1A1A2E',
                marginBottom: 32,
                lineHeight: 1.3,
              }}
            >
              How Does HERR Reprogram The Inner Voice?
            </h2>
          </ScrollFadeIn>
          <ScrollFadeIn delay={100}>
            <p style={{ fontSize: '1.125rem', color: '#1A1A2E', lineHeight: 1.8, marginBottom: 24 }}>
              Once regulated, HERR delivers I AM declarations in the user&apos;s own voice to install new identity programming at the subconscious level. This is not positive thinking. It is deliberate cognitive restructuring using the most trusted voice available: your own. Each script is generated based on the specific existential concerns identified in the ECQO assessment, targeting the precise areas where the user&apos;s inner voice is running outdated or harmful programming.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={200}>
            <p style={{ fontSize: '1.125rem', color: '#1A1A2E', lineHeight: 1.8, marginBottom: 24 }}>
              The grammatical structure of I AM statements activates deeper self-schema processing than generic motivational content. This is not one-size-fits-all reprogramming. It is personalized intervention at the identity level, delivered through eight activity modes: Workout, Driving, Sleep, Morning, Deep Work, Love and Family, Abundance, and Healing.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={300}>
            <p style={{ fontSize: '1.125rem', color: '#1A1A2E', lineHeight: 1.8 }}>
              Transformation follows you through every part of your day. You are not being told you can. You are being reminded of who you are already becoming, in the only voice powerful enough to make it real.
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ── Section 6: Is HERR Clinically Validated? (dark) ──────────── */}
      <section style={{ background: '#0A0A0F', padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <ScrollFadeIn>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(28px, 4vw, 36px)',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: 32,
                lineHeight: 1.3,
              }}
            >
              Is HERR Clinically Validated?
            </h2>
          </ScrollFadeIn>
          <ScrollFadeIn delay={100}>
            <p style={{ fontSize: '1.125rem', color: '#FAF8F5', lineHeight: 1.8 }}>
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
        <ScrollFadeIn>
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
        </ScrollFadeIn>
      </section>

      <CrisisResource variant="light" />
    </main>
  );
}
