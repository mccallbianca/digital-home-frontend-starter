'use client';

/**
 * OnboardingFlow — ECQO WS2 Clinical Onboarding
 * ===============================================
 *
 * New flow (WS2 conversational):
 *   Step 1: Profile Setup (unchanged)
 *   Step 2: Phase 1 — Conversational Baseline Profile (6 AI questions)
 *   Step 3: Phase 1 Debrief — Results screen
 *   Step 4: Phase 2 — Conversational Activity Mode Selection
 *   Step 5: Phase 3 — Conversational Identity Anchor Capture
 *   Step 6: Voice + Consent (Personalized/Elite only — unchanged)
 *   Step 7: Phase 5 — Script Handoff + Complete
 *
 * Fallback: If Claude API is unavailable, reverts to original
 * Likert questionnaire + checkbox activity modes.
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import StepProfile from './StepProfile';
import StepAssessmentChoice from './StepAssessmentChoice';
import StepQuestionnaire from './StepQuestionnaire';
import StepVoice from './StepVoice';
import StepActivityModes from './StepActivityModes';
import ConversationalChat, { type PhaseCompleteData } from './ConversationalChat';
import StepDebrief from './StepDebrief';

// ── Types ───────────────────────────────────────────────────
interface OnboardingFlowProps {
  userId: string;
  userEmail: string;
  plan: 'personalized' | 'elite' | null;
  existingProfile: {
    firstName: string;
    lastName: string;
    preferredName: string;
    pronouns: string;
    timezone: string;
  } | null;
}

interface SafetyFlag {
  type: string;
  severity: string;
  shouldPauseOnboarding: boolean;
}

// ── Step Types ──────────────────────────────────────────────
type StepType =
  | 'profile'
  | 'assessment-choice'
  | 'phase1-chat'
  | 'phase1-debrief'
  | 'phase2-chat'
  | 'phase3-chat'
  | 'voice'
  | 'handoff'
  // Fallback steps (original)
  | 'fallback-questionnaire'
  | 'fallback-modes'
  | 'safety-pause';

// ── Step flow builder ───────────────────────────────────────
// When path is null, we start with the choice step
// When path is 'conversational', we build the AI flow
// When path is 'clickthrough', we build the form flow
function buildStepFlow(
  plan: string | null,
  path: 'conversational' | 'clickthrough' | null,
): StepType[] {
  const hasVoice = plan === 'personalized' || plan === 'elite';

  // Haven't chosen yet — show choice step after profile
  if (path === null) {
    return ['profile', 'assessment-choice'];
  }

  if (path === 'clickthrough') {
    // Original form flow
    const steps: StepType[] = ['profile', 'assessment-choice', 'fallback-questionnaire'];
    if (hasVoice) steps.push('voice');
    steps.push('fallback-modes');
    return steps;
  }

  // WS2 conversational flow
  const steps: StepType[] = [
    'profile',
    'assessment-choice',
    'phase1-chat',
    'phase1-debrief',
    'phase2-chat',
    'phase3-chat',
  ];
  if (hasVoice) steps.push('voice');
  steps.push('handoff');
  return steps;
}

function getStepLabel(step: StepType): string {
  switch (step) {
    case 'profile': return 'Profile Setup';
    case 'assessment-choice': return 'Choose Your Path';
    case 'phase1-chat': return 'Existential Profile';
    case 'phase1-debrief': return 'Your Results';
    case 'phase2-chat': return 'Activity Modes';
    case 'phase3-chat': return 'Identity Anchors';
    case 'voice': return 'Voice + Consent';
    case 'handoff': return 'Finalizing';
    case 'fallback-questionnaire': return 'Existential Questionnaire';
    case 'fallback-modes': return 'Activity Modes';
    case 'safety-pause': return 'Safety Pause';
    default: return '';
  }
}

// ── Main Component ──────────────────────────────────────────
export default function OnboardingFlow({ userId, userEmail, plan, existingProfile }: OnboardingFlowProps) {
  const router = useRouter();
  const supabase = createClient();

  // ── State ─────────────────────────────────────────────────
  const [assessmentPath, setAssessmentPath] = useState<'conversational' | 'clickthrough' | null>(null);
  const [steps, setSteps] = useState<StepType[]>(() => buildStepFlow(plan, null));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isCompletingOnboarding, setIsCompletingOnboarding] = useState(false);

  // Profile data
  const [profileData, setProfileData] = useState({
    firstName: existingProfile?.firstName ?? '',
    lastName: existingProfile?.lastName ?? '',
    preferredName: existingProfile?.preferredName ?? '',
    pronouns: existingProfile?.pronouns ?? '',
    timezone: existingProfile?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  // Fallback data
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [selectedModes, setSelectedModes] = useState<string[]>([]);

  // WS2 conversational data
  const [assessment, setAssessment] = useState<PhaseCompleteData['assessment'] | null>(null);
  const [discoveredModes, setDiscoveredModes] = useState<string[]>([]);
  const [identityAnchors, setIdentityAnchors] = useState<Record<string, unknown>>({});
  const [communicationStyle, setCommunicationStyle] = useState<string | null>(null);
  const [safetyPause, setSafetyPause] = useState<SafetyFlag | null>(null);

  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;

  // ── Assessment choice handler ──────────────────────────────
  const handleAssessmentChoice = useCallback((path: 'conversational' | 'clickthrough') => {
    setAssessmentPath(path);
    const newSteps = buildStepFlow(plan, path);
    setSteps(newSteps);
    // Move past the choice step (index 1) to the next step (index 2)
    setCurrentStepIndex(2);
  }, [plan]);

  // ── Fallback handler (when AI is unavailable) ─────────────
  const handleFallback = useCallback(() => {
    setAssessmentPath('clickthrough');
    const fallbackSteps = buildStepFlow(plan, 'clickthrough');
    setSteps(fallbackSteps);
    // Jump to the fallback-questionnaire step (index 2)
    setCurrentStepIndex(2);
  }, [plan]);

  // ── Safety pause handler ──────────────────────────────────
  const handleSafetyPause = useCallback((flag: SafetyFlag) => {
    setSafetyPause(flag);
    // Insert safety-pause step into flow
    setSteps(prev => {
      const newSteps = [...prev];
      newSteps.splice(currentStepIndex + 1, 0, 'safety-pause');
      return newSteps;
    });
    setCurrentStepIndex(prev => prev + 1);
  }, [currentStepIndex]);

  // ── Phase completion handlers ─────────────────────────────
  const handlePhase1Complete = useCallback((data: PhaseCompleteData) => {
    if (data.assessment) {
      setAssessment(data.assessment);
    }
    if (data.communicationStyle) {
      setCommunicationStyle(data.communicationStyle);
    }
    setCurrentStepIndex(prev => prev + 1); // → debrief
  }, []);

  const handlePhase2Complete = useCallback((data: PhaseCompleteData) => {
    if (data.modes && data.modes.length > 0) {
      setDiscoveredModes(data.modes);
    }
    setCurrentStepIndex(prev => prev + 1); // → phase 3
  }, []);

  const handlePhase3Complete = useCallback((data: PhaseCompleteData) => {
    if (data.identityAnchors) {
      setIdentityAnchors(data.identityAnchors);
    }
    setCurrentStepIndex(prev => prev + 1); // → voice or handoff
  }, []);

  // ── Save profile (Step 1) ────────────────────────────────
  async function saveProfile() {
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: userId,
      email: userEmail,
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      preferred_name: profileData.preferredName || null,
      pronouns: profileData.pronouns || null,
      timezone: profileData.timezone,
      plan,
    }, { onConflict: 'id' });

    if (profileErr) throw profileErr;
  }

  // ── Save fallback questionnaire ───────────────────────────
  async function saveFallbackQuestionnaire() {
    const rows = Object.entries(responses).map(([idx, val]) => ({
      user_id: userId,
      question_index: parseInt(idx),
      response: val,
    }));
    await supabase.from('existential_responses').delete().eq('user_id', userId);
    const { error: respErr } = await supabase.from('existential_responses').insert(rows);
    if (respErr) throw respErr;
  }

  // ── Auto-complete when we reach the handoff step ──────────
  useEffect(() => {
    if (currentStep === 'handoff' && !isCompletingOnboarding) {
      setIsCompletingOnboarding(true);
      // Short delay so user sees the transition message
      const timer = setTimeout(() => {
        completeOnboarding(discoveredModes.length > 0 ? discoveredModes : ['morning']);
      }, 2500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // ── Complete onboarding ───────────────────────────────────
  async function completeOnboarding(modes: string[]) {
    // Save activity modes
    await supabase.from('user_preferences').upsert({
      user_id: userId,
      activity_modes: modes,
    }, { onConflict: 'user_id' });

    // If WS2 flow, submit Phase 5 handoff
    if (assessmentPath === 'conversational') {
      try {
        await fetch('/api/onboarding/handoff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            activeModes: modes.map(m => m.toUpperCase().replace('-', '_')),
            primaryMode: modes[0]?.toUpperCase().replace('-', '_') || 'MORNING',
            coreValues: identityAnchors.coreValues || [],
            definingAchievement: identityAnchors.definingAchievement || {
              description: '',
              emotional_signature: '',
              identity_language: '',
            },
            significantRelationship: identityAnchors.significantRelationship || undefined,
            aspirationalIdentity: identityAnchors.aspirationalIdentity || {
              description: '',
              gap_assessment: '',
              pathway_clarity: '',
            },
            selfLanguageWords: identityAnchors.selfLanguageWords || [],
            communicationStyle: communicationStyle || undefined,
          }),
        });
      } catch (err) {
        console.error('[ECQO Handoff Error]', err);
        // Non-fatal — continue even if handoff fails
      }
    }

    // Mark onboarding complete
    await supabase.from('profiles').update({
      onboarding_complete: true,
    }).eq('id', userId);

    router.push('/dashboard?welcome=1');
  }

  // ── Navigation handler ────────────────────────────────────
  async function handleNext() {
    setSaving(true);
    setError('');

    try {
      switch (currentStep) {
        case 'profile':
          await saveProfile();
          setCurrentStepIndex(prev => prev + 1);
          break;

        case 'phase1-debrief':
          setCurrentStepIndex(prev => prev + 1);
          break;

        case 'voice':
          setCurrentStepIndex(prev => prev + 1);
          break;

        case 'handoff':
          // Auto-handled by useEffect — no manual action needed
          return;

        // Fallback steps
        case 'fallback-questionnaire':
          await saveFallbackQuestionnaire();
          setCurrentStepIndex(prev => prev + 1);
          break;

        case 'fallback-modes':
          await completeOnboarding(selectedModes);
          return;

        case 'safety-pause':
          // Can't proceed from safety pause
          return;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  // ── Can proceed check ─────────────────────────────────────
  function canProceed(): boolean {
    switch (currentStep) {
      case 'profile':
        return !!(profileData.firstName.trim() && profileData.lastName.trim() && profileData.timezone);
      case 'assessment-choice':
        return false; // Handled by its own buttons
      case 'phase1-debrief':
        return !!assessment;
      case 'voice':
        return true;
      case 'handoff':
        return false; // Auto-completes
      case 'fallback-questionnaire':
        return Object.keys(responses).length === 8;
      case 'fallback-modes':
        return selectedModes.length >= 1 && selectedModes.length <= 3;
      case 'safety-pause':
        return false;
      default:
        return false; // Chat steps handle their own navigation
    }
  }

  // ── Render step content ───────────────────────────────────
  function renderStep() {
    switch (currentStep) {
      case 'profile':
        return <StepProfile data={profileData} onChange={setProfileData} />;

      case 'assessment-choice':
        return (
          <StepAssessmentChoice
            userName={profileData.preferredName || profileData.firstName}
            onChoose={handleAssessmentChoice}
          />
        );

      case 'phase1-chat':
        return (
          <ConversationalChat
            phase="PHASE_1_BASELINE"
            userId={userId}
            userName={profileData.preferredName || profileData.firstName}
            onPhaseComplete={handlePhase1Complete}
            onSafetyPause={handleSafetyPause}
            onFallback={handleFallback}
          />
        );

      case 'phase1-debrief':
        return assessment ? (
          <StepDebrief
            assessment={assessment}
            onContinue={() => setCurrentStepIndex(prev => prev + 1)}
          />
        ) : (
          <p className="text-[var(--herr-muted)]">Loading results...</p>
        );

      case 'phase2-chat':
        return (
          <ConversationalChat
            phase="PHASE_2_ACTIVITY_MODES"
            userId={userId}
            userName={profileData.preferredName || profileData.firstName}
            onPhaseComplete={handlePhase2Complete}
            onSafetyPause={handleSafetyPause}
            onFallback={handleFallback}
          />
        );

      case 'phase3-chat':
        return (
          <ConversationalChat
            phase="PHASE_3_IDENTITY_ANCHORS"
            userId={userId}
            userName={profileData.preferredName || profileData.firstName}
            onPhaseComplete={handlePhase3Complete}
            onSafetyPause={handleSafetyPause}
            onFallback={handleFallback}
          />
        );

      case 'voice':
        return <StepVoice userId={userId} />;

      case 'handoff':
        return (
          <div className="animate-fade-up text-center py-16">
            {/* Animated pulse ring */}
            <div className="w-20 h-20 mx-auto mb-8 relative">
              <div className="absolute inset-0 border-2 border-[var(--herr-pink)] rounded-full animate-ping opacity-20" />
              <div className="absolute inset-0 border border-[var(--herr-pink)] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[var(--herr-pink)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--herr-white)] mb-3">
              Your HERR profile is ready.
            </h2>
            <p className="text-[var(--herr-muted)] leading-relaxed max-w-md mx-auto">
              Taking you to your Dashboard now...
            </p>
          </div>
        );

      // Fallback steps
      case 'fallback-questionnaire':
        return <StepQuestionnaire responses={responses} onChange={setResponses} />;

      case 'fallback-modes':
        return <StepActivityModes selected={selectedModes} onChange={setSelectedModes} />;

      case 'safety-pause':
        return (
          <div className="animate-fade-up text-center py-12">
            <div className="w-16 h-16 mx-auto mb-6 border-2 border-[rgba(239,68,68,0.4)] rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="font-display text-3xl text-[var(--herr-white)] mb-4">
              We&apos;re here for you.
            </h2>
            <p className="text-[var(--herr-muted)] leading-relaxed max-w-md mx-auto mb-8">
              A member of our team will reach out to you personally.
              Your HERR program isn&apos;t going anywhere, we&apos;ll pick this up
              once you&apos;ve had that conversation.
            </p>
            {safetyPause && (
              <p className="text-[0.72rem] text-[var(--herr-faint)]">
                Reference: {safetyPause.type} | Severity: {safetyPause.severity}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  }

  // ── Check if current step uses chat (no Next button) ──────
  const isChatStep = ['phase1-chat', 'phase2-chat', 'phase3-chat'].includes(currentStep);
  const isDebriefStep = currentStep === 'phase1-debrief';
  const isSafetyPause = currentStep === 'safety-pause';
  const isChoiceStep = currentStep === 'assessment-choice';
  const isHandoff = currentStep === 'handoff';

  return (
    <div className="max-w-2xl mx-auto px-6 py-24">
      {/* Progress indicator */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <p className="herr-label text-[var(--herr-muted)]">
            Step {currentStepIndex + 1} of {totalSteps}
          </p>
          <p className="herr-label text-[var(--herr-pink)]">
            {getStepLabel(currentStep)}
          </p>
        </div>
        <div className="w-full h-1 bg-[var(--herr-surface)] overflow-hidden">
          <div
            className="h-full bg-[var(--herr-pink)] transition-all duration-500"
            style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      {renderStep()}

      {/* Error */}
      {error && (
        <div className="mt-6 p-3 border border-[var(--herr-pink)] bg-[var(--herr-surface)]">
          <p className="text-[0.8rem] text-[var(--herr-pink)]">{error}</p>
        </div>
      )}

      {/* Navigation — only shown for non-chat steps */}
      {!isChatStep && !isDebriefStep && !isSafetyPause && !isChoiceStep && !isHandoff && (
        <div className="flex items-center justify-between mt-12">
          {currentStepIndex > 0 ? (
            <button
              onClick={() => setCurrentStepIndex(prev => prev - 1)}
              className="btn-herr-ghost"
            >
              Back
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={handleNext}
            disabled={saving || !canProceed()}
            className="btn-herr-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving
              ? 'Saving…'
              : currentStep === 'fallback-modes'
                ? 'Complete Setup'
                : 'Continue'
            }
          </button>
        </div>
      )}
    </div>
  );
}
