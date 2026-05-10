'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface VoiceSetupClientProps {
  userId: string;
  hasVoice: boolean;
  voiceDate: string | null;
}

const PASSAGE = `I am becoming who I was always meant to be. The voice inside me is powerful, and it speaks truth. Every day, I regulate first and reprogram second. I trust the process. I trust my voice. I am HERR.`;

export default function VoiceSetupClient({ userId, hasVoice, voiceDate }: VoiceSetupClientProps) {
  const [consented, setConsented] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(hasVoice);
  const [duration, setDuration] = useState(0);
  const [showRecorder, setShowRecorder] = useState(!hasVoice);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        blobRef.current = blob;
        audioRef.current = new Audio(URL.createObjectURL(blob));
        setRecorded(true);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch {
      alert('Microphone access is required for voice cloning.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecording(false);
  };

  const playback = () => {
    if (!audioRef.current) return;
    setPlaying(true);
    audioRef.current.onended = () => setPlaying(false);
    audioRef.current.play();
  };

  const reRecord = () => {
    setRecorded(false);
    setDuration(0);
    blobRef.current = null;
    audioRef.current = null;
  };

  const submitVoice = async () => {
    if (!blobRef.current) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.append('audio', blobRef.current, `voice-sample-${userId}.webm`);
    formData.append('userId', userId);

    try {
      await fetch('/api/onboarding/voice-consent', {
        method: 'POST',
        body: formData,
      });
      setSubmitted(true);
      setShowRecorder(false);
    } catch {
      alert('Upload failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', padding: '80px 24px 60px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Header */}
        <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '2px', color: '#C42D8E', marginBottom: 8, textAlign: 'center' }}>
          VOICE CLONE
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 600, color: '#FFFFFF', textAlign: 'center', marginBottom: 8 }}>
          Set Up Your Voice
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 32, lineHeight: 1.6 }}>
          Record a brief voice sample. HERR will clone your voice to deliver daily affirmations
          that speak directly to your subconscious.
        </p>

        {/* Status card */}
        <div style={{ background: '#16161F', borderRadius: 16, padding: 32, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 24, textAlign: 'center' }}>
          {submitted ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
                <p style={{ fontSize: 14, color: '#FFFFFF' }}>Your voice clone is active.</p>
              </div>
              {voiceDate && (
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                  Last updated {new Date(voiceDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
              <button
                onClick={() => { setShowRecorder(true); setSubmitted(false); setRecorded(false); }}
                style={{
                  marginTop: 16, height: 40, padding: '0 24px', background: 'transparent', color: '#FFFFFF',
                  borderRadius: 12, border: '1px solid rgba(255,255,255,0.3)', fontSize: 13, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer',
                }}
              >
                Re-record Voice
              </button>
            </>
          ) : (
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Voice clone not yet configured</p>
          )}
        </div>

        {/* Success celebration */}
        {submitted && !showRecorder && (
          <div style={{ background: '#16161F', borderRadius: 16, padding: 32, border: '2px solid #C42D8E', textAlign: 'center', marginBottom: 24 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, color: '#FFFFFF', marginBottom: 8 }}>
              Your Voice Is Ready
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>
              Your cloned voice will be used to deliver daily I AM declarations.
              Your first personalized affirmation is being generated now.
            </p>
            <Link
              href="/dashboard/affirmations"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 48, padding: '0 32px',
                background: '#C42D8E', color: '#FFFFFF', borderRadius: 12, fontSize: 14, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '1px', textDecoration: 'none',
              }}
            >
              Go to My Affirmations
            </Link>
          </div>
        )}

        {/* Recording interface */}
        {showRecorder && !submitted && (
          <div style={{ background: '#16161F', borderRadius: 16, padding: 40, border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Consent checkbox */}
            {!consented && (
              <label style={{ display: 'flex', gap: 12, cursor: 'pointer', marginBottom: 32 }}>
                <input
                  type="checkbox"
                  checked={consented}
                  onChange={(e) => setConsented(e.target.checked)}
                  style={{ display: 'none' }}
                />
                <div
                  style={{
                    width: 20, height: 20, borderRadius: 4, flexShrink: 0, marginTop: 2,
                    background: consented ? '#C42D8E' : '#16161F',
                    border: consented ? '2px solid #C42D8E' : '1px solid rgba(255,255,255,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {consented && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  )}
                </div>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                  I consent to HERR cloning my voice for the purpose of delivering personalized affirmations.
                  My voice data is stored securely and will not be shared with third parties.
                  I can delete my voice profile at any time from Settings.
                </span>
              </label>
            )}

            {consented && (
              <>
                <p style={{ fontSize: 18, color: '#FFFFFF', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', Georgia, serif", marginBottom: 16 }}>
                  Please read the following passage aloud in your natural speaking voice:
                </p>

                <div style={{ background: '#111118', borderRadius: 12, padding: 24, marginBottom: 32 }}>
                  <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
                    {PASSAGE}
                  </p>
                </div>

                {/* Recording controls */}
                <div style={{ textAlign: 'center' }}>
                  {!recorded ? (
                    <>
                      <button
                        onClick={recording ? stopRecording : startRecording}
                        style={{
                          width: 80, height: 80, borderRadius: '50%',
                          background: recording ? '#EF4444' : '#C42D8E',
                          border: recording ? '3px solid rgba(239,68,68,0.3)' : 'none',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          margin: '0 auto 12px',
                          animation: recording ? 'pulseRing 1.5s ease-in-out infinite' : 'none',
                        }}
                      >
                        {recording ? (
                          <div style={{ width: 20, height: 20, borderRadius: 4, background: '#FFF' }} />
                        ) : (
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="#FFF" stroke="none">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
                            <line x1="12" y1="19" x2="12" y2="23" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        )}
                      </button>
                      <p style={{ fontSize: 14, color: recording ? '#EF4444' : 'rgba(255,255,255,0.5)' }}>
                        {recording ? `Recording... ${formatTime(duration)}` : 'Tap to record'}
                      </p>
                      {recording && (
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                          Minimum 30 seconds
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
                        <button
                          onClick={playback}
                          disabled={playing}
                          style={{
                            width: 48, height: 48, borderRadius: '50%', background: '#22C55E', border: 'none',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFF"><path d="M8 5v14l11-7z" /></svg>
                        </button>
                      </div>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
                        Duration: {formatTime(duration)}
                      </p>
                      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <button
                          onClick={reRecord}
                          style={{
                            height: 48, padding: '0 24px', background: 'transparent', color: '#FFFFFF',
                            borderRadius: 12, border: '1px solid rgba(255,255,255,0.3)', fontSize: 14,
                            fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer',
                          }}
                        >
                          Re-record
                        </button>
                        <button
                          onClick={submitVoice}
                          disabled={submitting || duration < 10}
                          style={{
                            height: 48, padding: '0 32px', background: '#C42D8E', color: '#FFFFFF',
                            borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 600,
                            textTransform: 'uppercase', letterSpacing: '1px',
                            cursor: submitting ? 'default' : 'pointer',
                            opacity: submitting ? 0.6 : 1,
                          }}
                        >
                          {submitting ? 'Uploading...' : 'Submit Voice Sample'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {!consented && (
              <Link href="/privacy#voice-data" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>
                Read our Voice Data Policy
              </Link>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulseRing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(239,68,68,0); }
        }
      `}</style>
    </div>
  );
}
