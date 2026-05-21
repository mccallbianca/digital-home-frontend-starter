'use client';

/**
 * Companion chat UI.
 *
 * Layout:
 *   - Message list (scrollable, user-right magenta, HERR-left cream-on-ink)
 *   - Sticky composer at the bottom
 *   - Crisis banner at the top if any rendered turn has safety_severity='red'
 *
 * Behavior:
 *   - On submit: optimistic user-message render, POST to /api/companion/chat,
 *     append assistant response on success, scroll to bottom.
 *   - The route returns a conversation_id; we keep it in state so subsequent
 *     turns belong to the same thread.
 *   - Save & Continue Later button isn't strictly needed (rows already
 *     persisted per turn) but a "Start new conversation" toggle is — it
 *     resets the conversation_id so the next message opens a fresh thread.
 */

import { useEffect, useRef, useState } from 'react';

export type CompanionMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  safety_flag?: boolean;
  safety_severity?: 'green' | 'yellow' | 'red' | null;
  created_at: string;
};

interface CompanionClientProps {
  initialMessages: CompanionMessage[];
  initialConversationId: string | null;
  displayName: string;
}

const CRISIS_RESOURCES_HTML = `
  <strong>You are not alone.</strong><br/>
  <span style="font-size:13px;line-height:1.55">
    988 Suicide &amp; Crisis Lifeline — call or text <strong>988</strong><br/>
    Crisis Text Line — text <strong>HOME</strong> to <strong>741741</strong>
  </span>
`;

export default function CompanionClient({
  initialMessages,
  initialConversationId,
  displayName,
}: CompanionClientProps) {
  const [messages, setMessages] = useState<CompanionMessage[]>(initialMessages);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  // Focus composer on mount
  useEffect(() => {
    composerRef.current?.focus();
  }, []);

  // Show crisis banner if ANY rendered turn flagged red.
  const anyRed = messages.some((m) => m.safety_severity === 'red');

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setError(null);
    setSending(true);
    const optimisticUser: CompanionMessage = {
      id: `tmp-${Date.now()}`,
      role: 'user',
      content: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimisticUser]);
    setInput('');

    try {
      const res = await fetch('/api/companion/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          conversation_id: conversationId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? `HERR couldn't respond (${res.status}).`);
        // Roll back the optimistic user turn — the server didn't persist it.
        setMessages((m) => m.filter((x) => x.id !== optimisticUser.id));
        composerRef.current?.focus();
        return;
      }
      if (data.conversation_id && data.conversation_id !== conversationId) {
        setConversationId(data.conversation_id);
      }
      const assistantTurn: CompanionMessage = {
        id: data.turn_id ?? `asst-${Date.now()}`,
        role: 'assistant',
        content: data.response ?? '',
        safety_flag: !!data.safety_flag,
        safety_severity: data.safety_severity ?? 'green',
        created_at: new Date().toISOString(),
      };
      setMessages((m) => [...m, assistantTurn]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setMessages((m) => m.filter((x) => x.id !== optimisticUser.id));
    } finally {
      setSending(false);
      composerRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function startNewConversation() {
    if (!confirm('Start a fresh conversation? Past turns stay saved — you just won\'t see them above. HERR also won\'t reference them.')) return;
    setConversationId(null);
    setMessages([]);
    composerRef.current?.focus();
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {anyRed && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(196,45,142,0.16), rgba(196,45,142,0.04))',
            border: '1px solid var(--herr-magenta, #C42D8E)',
            borderRadius: 12,
            padding: '14px 18px',
            marginBottom: 14,
            color: 'var(--herr-magenta-deep, #6b1849)',
            fontSize: 14,
            lineHeight: 1.6,
          }}
          role="alert"
          dangerouslySetInnerHTML={{ __html: CRISIS_RESOURCES_HTML }}
        />
      )}

      {/* Message list */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          background: '#FFFFFF',
          border: '1px solid var(--herr-line)',
          borderRadius: 16,
          padding: 20,
          minHeight: 320,
          maxHeight: 'calc(100vh - 360px)',
          marginBottom: 14,
        }}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 16px', color: 'var(--herr-ink-soft)' }}>
            <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0 }}>
              Hi {displayName}. I&apos;m here. What&apos;s on your mind today?
            </p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 14 }}>
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <li
                  key={m.id}
                  style={{
                    display: 'flex',
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '12px 16px',
                      borderRadius: 14,
                      borderTopRightRadius: isUser ? 4 : 14,
                      borderTopLeftRadius: isUser ? 14 : 4,
                      background: isUser
                        ? 'var(--herr-magenta, #C42D8E)'
                        : 'var(--herr-cream, #FAF8F3)',
                      color: isUser ? '#FFFFFF' : 'var(--herr-ink)',
                      fontSize: 15,
                      lineHeight: 1.55,
                      whiteSpace: 'pre-wrap',
                      border: isUser ? 'none' : '1px solid var(--herr-line)',
                    }}
                  >
                    {m.content}
                  </div>
                </li>
              );
            })}
            {sending && (
              <li style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 14,
                    borderTopLeftRadius: 4,
                    background: 'var(--herr-cream, #FAF8F3)',
                    border: '1px solid var(--herr-line)',
                    color: 'var(--herr-ink-soft)',
                    fontSize: 13,
                    fontStyle: 'italic',
                  }}
                >
                  HERR is thinking…
                </div>
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Error */}
      {error && (
        <p
          role="alert"
          style={{
            fontSize: 13,
            color: '#8a1c1c',
            background: '#fbdada',
            padding: '8px 12px',
            borderRadius: 8,
            marginBottom: 10,
          }}
        >
          {error}
        </p>
      )}

      {/* Composer */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--herr-line)',
          borderRadius: 16,
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <textarea
          ref={composerRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={messages.length === 0 ? `What's on your mind, ${displayName}?` : 'Reply to HERR…'}
          rows={2}
          disabled={sending}
          style={{
            width: '100%',
            resize: 'none',
            border: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            fontSize: 15,
            lineHeight: 1.55,
            background: 'transparent',
            color: 'var(--herr-ink)',
            padding: '4px 6px',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <button
            onClick={startNewConversation}
            disabled={sending}
            style={{
              fontSize: 12,
              color: 'var(--herr-ink-soft)',
              background: 'transparent',
              border: 'none',
              cursor: sending ? 'not-allowed' : 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Start a new conversation
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            style={{
              padding: '10px 22px',
              background: 'var(--herr-ink, #1A1A2E)',
              color: 'var(--herr-cream, #FAF8F3)',
              border: 'none',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: (!input.trim() || sending) ? 'not-allowed' : 'pointer',
              opacity: (!input.trim() || sending) ? 0.5 : 1,
              transition: 'opacity 150ms',
            }}
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>

      <p style={{ fontSize: 11, color: 'var(--herr-ink-soft)', margin: '10px 4px 0', lineHeight: 1.55, textAlign: 'center' }}>
        HERR is a clinical wellness AI, not a substitute for crisis or therapy services. If you&apos;re in danger, call <strong>988</strong>.
      </p>
    </div>
  );
}
