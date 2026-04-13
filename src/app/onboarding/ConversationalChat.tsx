'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { OnboardingPhase } from '@/lib/ecqo-config';
import type { QuestionScores } from '@/lib/ecqo/scoring';

// ── Types ───────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SafetyFlag {
  type: string;
  severity: string;
  shouldPauseOnboarding: boolean;
}

interface ConversationalChatProps {
  phase: OnboardingPhase;
  userId: string;
  userName?: string;
  onPhaseComplete: (data: PhaseCompleteData) => void;
  onSafetyPause: (flag: SafetyFlag) => void;
  onFallback: () => void;  // trigger if Claude API unavailable
}

export interface PhaseCompleteData {
  phase: OnboardingPhase;
  assessment?: {
    ecqo_risk_index: number;
    risk_tier: string;
    domain_scores: Record<string, number>;
  };
  modes?: string[];
  identityAnchors?: Record<string, unknown>;
  communicationStyle?: string;
}

// ── Phase Configuration ─────────────────────────────────────
const PHASE_CONFIG: Record<string, {
  totalQuestions: number;
  title: string;
  subtitle: string;
}> = {
  PHASE_1_BASELINE: {
    totalQuestions: 6,
    title: 'Existential Profile.',
    subtitle: 'Six questions about what matters most to you. No right or wrong answers.',
  },
  PHASE_2_ACTIVITY_MODES: {
    totalQuestions: 3,  // flexible — AI guides the conversation
    title: 'Your Daily Rhythm.',
    subtitle: 'Let\'s figure out when HERR will be most powerful for you.',
  },
  PHASE_3_IDENTITY_ANCHORS: {
    totalQuestions: 5,
    title: 'Who You Are.',
    subtitle: 'The words you share here become the foundation of your personalized affirmations.',
  },
};

// ── Detect phase completion from AI response ────────────────
function detectPhaseCompletion(
  aiMessage: string,
  phase: OnboardingPhase,
  questionIndex: number
): boolean {
  const config = PHASE_CONFIG[phase];
  if (!config) return false;

  // For Phase 1: complete after Q6 response is processed
  if (phase === 'PHASE_1_BASELINE' && questionIndex >= 5) return true;

  // For Phase 2: detect when AI confirms mode selections
  if (phase === 'PHASE_2_ACTIVITY_MODES') {
    const completionSignals = [
      /let'?s move on/i,
      /great choices?/i,
      /we'?ve got your modes/i,
      /those are.*modes/i,
      /ready to move/i,
      /next.*want to ask/i,
      /now.*want to learn/i,
      /perfect.*start/i,
    ];
    if (questionIndex >= 2 && completionSignals.some(p => p.test(aiMessage))) return true;
  }

  // For Phase 3: complete after prompt 5
  if (phase === 'PHASE_3_IDENTITY_ANCHORS' && questionIndex >= 4) return true;

  return false;
}

// ── Extract modes from Phase 2 conversation ─────────────────
function extractModesFromConversation(messages: ChatMessage[]): string[] {
  const allText = messages.map(m => m.content).join(' ').toLowerCase();
  const modePatterns: Record<string, RegExp[]> = {
    'workout':     [/workout/i, /gym/i, /exercise/i, /training/i, /run(ning)?/i, /lift(ing)?/i],
    'driving':     [/driv(e|ing)/i, /commut/i, /car/i, /road/i],
    'sleep':       [/sleep/i, /bed(time)?/i, /night/i, /rest/i],
    'morning':     [/morning/i, /wake( up)?/i, /sunrise/i],
    'deep-work':   [/deep work/i, /focus/i, /creative/i, /study/i, /writing/i, /coding/i],
    'love-family': [/love/i, /family/i, /partner/i, /kids?/i, /children/i, /spouse/i, /parenting/i],
    'abundance':   [/abundance/i, /wealth/i, /financ/i, /money/i, /career/i, /business/i],
    'healing':     [/heal(ing)?/i, /grief/i, /recovery/i, /therapy/i, /process(ing)?/i],
  };

  const detected: string[] = [];
  for (const [mode, patterns] of Object.entries(modePatterns)) {
    if (patterns.some(p => p.test(allText))) {
      detected.push(mode);
    }
  }

  // Limit to 3, prioritize in conversation order
  return detected.slice(0, 3);
}

// ── Main Component ──────────────────────────────────────────
export default function ConversationalChat({
  phase,
  userId,
  userName,
  onPhaseComplete,
  onSafetyPause,
  onFallback,
}: ConversationalChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(-1); // -1 = initial greeting
  const [questionScores, setQuestionScores] = useState<QuestionScores[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input after AI responds
  useEffect(() => {
    if (!isLoading && !isPaused) {
      inputRef.current?.focus();
    }
  }, [isLoading, isPaused]);

  // ── Send initial greeting ─────────────────────────────────
  const sendInitialGreeting = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/onboarding/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase,
          questionIndex: 0,
          userMessage: '',
          conversationHistory: [],
          userId,
          userName,
        }),
      });

      const data = await res.json();

      if (data.fallback) {
        onFallback();
        return;
      }

      if (data.aiMessage) {
        setMessages([{
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.aiMessage,
          timestamp: new Date(),
        }]);
        setQuestionIndex(0);
      }
    } catch {
      onFallback();
    } finally {
      setIsLoading(false);
    }
  }, [phase, userId, userName, onFallback]);

  useEffect(() => {
    sendInitialGreeting();
  }, [sendInitialGreeting]);

  // ── Send message ──────────────────────────────────────────
  async function handleSend() {
    if (!input.trim() || isLoading || isPaused) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to chat
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const conversationHistory = updatedMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const nextIndex = questionIndex + 1;

      const res = await fetch('/api/onboarding/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase,
          questionIndex: nextIndex,
          userMessage,
          conversationHistory,
          userId,
          userName,
          questionScores,
        }),
      });

      const data = await res.json();

      if (data.fallback) {
        onFallback();
        return;
      }

      // Safety flag handling
      if (data.safetyFlag?.shouldPauseOnboarding) {
        setIsPaused(true);
        if (data.aiMessage) {
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: data.aiMessage,
            timestamp: new Date(),
          }]);
        }
        onSafetyPause(data.safetyFlag);
        return;
      }

      // Add AI response
      if (data.aiMessage) {
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.aiMessage,
          timestamp: new Date(),
        }]);
      }

      // Update scores
      if (data.questionScore) {
        setQuestionScores(prev => [...prev, data.questionScore]);
      }

      setQuestionIndex(nextIndex);

      // Check for phase completion
      if (data.assessment || detectPhaseCompletion(data.aiMessage || '', phase, nextIndex)) {
        // Small delay so user can read the final message
        setTimeout(() => {
          const completeData: PhaseCompleteData = {
            phase,
            assessment: data.assessment,
            communicationStyle: data.communicationStyle,
          };

          if (phase === 'PHASE_2_ACTIVITY_MODES') {
            completeData.modes = extractModesFromConversation([...updatedMessages, {
              id: 'ai',
              role: 'assistant',
              content: data.aiMessage || '',
              timestamp: new Date(),
            }]);
          }

          onPhaseComplete(completeData);
        }, 2000);
      }

    } catch {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'I\'m having a moment, let me catch up. Could you try sending that again?',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  // ── Handle keyboard ───────────────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ── Auto-resize textarea ──────────────────────────────────
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }

  const config = PHASE_CONFIG[phase] || PHASE_CONFIG.PHASE_1_BASELINE;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--herr-white)] mb-3">
          {config.title}
        </h2>
        <p className="text-[var(--herr-muted)] leading-relaxed">
          {config.subtitle}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 mb-6 min-h-[300px] max-h-[50vh] pr-2 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}
          >
            <div
              className={`max-w-[85%] px-5 py-4 ${
                msg.role === 'user'
                  ? 'bg-[var(--herr-pink-dim)] border border-[rgba(217,70,239,0.2)] text-[var(--herr-white)]'
                  : 'bg-[var(--herr-surface)] border border-[var(--herr-border)] text-[var(--herr-white)]'
              }`}
            >
              {msg.role === 'assistant' && (
                <p className="herr-label text-[var(--herr-cobalt)] mb-2">HERR</p>
              )}
              <div className="text-[0.92rem] leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-[var(--herr-surface)] border border-[var(--herr-border)] px-5 py-4">
              <p className="herr-label text-[var(--herr-cobalt)] mb-2">HERR</p>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-[var(--herr-muted)] rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-[var(--herr-muted)] rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                <span className="w-2 h-2 bg-[var(--herr-muted)] rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {!isPaused ? (
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? 'HERR is thinking...' : 'Type your response...'}
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-[var(--herr-surface)] border border-[var(--herr-border)] text-[var(--herr-white)] px-4 py-3 text-sm resize-none focus:outline-none focus:border-[var(--herr-cobalt)] transition-colors placeholder:text-[var(--herr-faint)] disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="btn-herr-primary !px-5 !py-3 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            aria-label="Send message"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.05)] p-4 text-center">
          <p className="text-sm text-[var(--herr-muted)]">
            Your onboarding is paused. A member of our team will reach out to you.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-4 text-[0.68rem] text-[var(--herr-faint)] leading-relaxed">
        This is a wellness screening tool and does not constitute a clinical diagnosis.
        Your responses are encrypted and protected under our{' '}
        <span className="text-[var(--herr-pink)] cursor-pointer hover:underline">privacy policy</span>.
      </p>
    </div>
  );
}
