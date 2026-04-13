'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/browser';

const VOICE_SCRIPT =
  'I am present. I am powerful. I am evolving. My inner voice is my greatest asset. I choose growth. I choose healing. I choose to become who I was always meant to be. ' +
  'Today I am choosing purpose. Today I am enough. Today I am exactly where I need to be. I am someone who shows up when it\'s hard. I am discipline. I am the one who keeps going. ' +
  'I am safe in this moment. I am allowed to rest. I am becoming who I was always meant to be. My mind is clear and my work matters. I am focused. I am capable. ' +
  'I am building wealth with intention. I am worthy of financial freedom. Money flows toward me because I am disciplined and I am generous with what I receive. ' +
  'I am present for the people who need me. I am love in action. I am worthy of the love I receive. I am healing at my own pace. I am not what happened to me. I am the one who survived and I am still here. ' +
  'When I speak, my words carry the weight of someone who has done the work. When I listen, I hear beyond what is said. When I rest, I trust that the world will hold. ' +
  'I am not defined by my roles. I am not defined by my past. I am defined by the truth I carry in my own voice. This voice is mine. These words are mine. This life is mine. ' +
  'I am the author of my story. I am the architect of my healing. I am the evidence that transformation is real. And every time I hear these words in my own voice, I remember who I really am.';

const ACCEPTED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a', 'audio/m4a'];
const MAX_SIZE = 25 * 1024 * 1024; // 25MB

export default function StepVoice({ userId }: { userId: string }) {
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const bothConsented = consent1 && consent2;

  async function handleUpload() {
    if (!file || !bothConsented) return;
    setError('');
    setUploading(true);

    try {
      const supabase = createClient();

      // Upload to Supabase Storage
      const ext = file.name.split('.').pop() ?? 'mp3';
      const path = `${userId}/sample.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('voice-samples')
        .upload(path, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      // Save consent record via server-side API (bypasses RLS)
      const consentRes = await fetch('/api/onboarding/voice-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, filePath: path }),
      });

      if (!consentRes.ok) {
        const consentData = await consentRes.json();
        throw new Error(consentData.error || 'Failed to save consent.');
      }

      setUploaded(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    setError('');
    if (!selected) return;

    if (!ACCEPTED_TYPES.includes(selected.type) && !selected.name.match(/\.(mp3|wav|m4a)$/i)) {
      setError('Please upload an MP3, WAV, or M4A file.');
      return;
    }
    if (selected.size > MAX_SIZE) {
      setError('File must be under 25MB.');
      return;
    }
    setFile(selected);
    setUploaded(false);
  }

  return (
    <div>
      <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--herr-white)] mb-3">
        Voice + Consent.
      </h2>
      <p className="text-[var(--herr-muted)] mb-10 leading-relaxed">
        Your voice is the instrument of your reprogramming. We need your consent and a voice sample
        to create your personalized affirmation library.
      </p>

      {/* Consent checkboxes */}
      <div className="space-y-4 mb-10">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={consent1}
            onChange={e => setConsent1(e.target.checked)}
            className="mt-1 w-4 h-4 accent-[var(--herr-pink)] shrink-0"
          />
          <span className="text-[0.88rem] text-[var(--herr-muted)] leading-relaxed group-hover:text-[var(--herr-white)] transition-colors">
            I consent to the recording, cloning, and use of my voice for personalized audio content within the HERR platform.
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={consent2}
            onChange={e => setConsent2(e.target.checked)}
            className="mt-1 w-4 h-4 accent-[var(--herr-pink)] shrink-0"
          />
          <span className="text-[0.88rem] text-[var(--herr-muted)] leading-relaxed group-hover:text-[var(--herr-white)] transition-colors">
            I understand this content is for wellness purposes and is not a substitute for professional mental health treatment.
          </span>
        </label>
      </div>

      {/* Voice sample upload */}
      {bothConsented && (
        <div className="animate-fade-up">
          <div className="border border-[var(--herr-border)] p-6 mb-6">
            <p className="herr-label text-[var(--herr-cobalt)] mb-3">Voice Sample Script</p>
            <p className="text-[var(--herr-muted)] leading-relaxed mb-4">
              Record yourself reading the following passage aloud, at a natural, steady pace. This should take approximately 3 minutes:
            </p>
            <blockquote className="border-l-2 border-[var(--herr-pink)] pl-4 italic font-display text-lg text-[var(--herr-white)] leading-relaxed">
              &ldquo;{VOICE_SCRIPT}&rdquo;
            </blockquote>
          </div>

          <div className="space-y-4">
            <p className="herr-label text-[var(--herr-muted)]">
              Upload your recording (.mp3, .wav, or .m4a, max 25MB)
            </p>

            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-[var(--herr-border-mid)] p-8 text-center cursor-pointer hover:border-[var(--herr-cobalt)] transition-colors"
            >
              <input
                ref={fileRef}
                type="file"
                accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/mp4"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div>
                  <p className="text-[var(--herr-white)] mb-1">{file.name}</p>
                  <p className="text-[0.78rem] text-[var(--herr-muted)]">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-[var(--herr-muted)] mb-1">Click to select a file</p>
                  <p className="text-[0.75rem] text-[var(--herr-faint)]">or drag and drop</p>
                </div>
              )}
            </div>

            {file && !uploaded && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="btn-herr-primary disabled:opacity-50"
              >
                {uploading ? 'Uploading…' : 'Upload Voice Sample'}
              </button>
            )}

            {uploaded && (
              <div className="p-4 border border-[var(--herr-cobalt)] bg-[var(--herr-surface)]">
                <p className="text-[var(--herr-cobalt)] text-sm font-medium">
                  Voice sample uploaded successfully.
                </p>
              </div>
            )}

            {error && (
              <p className="text-[0.78rem] text-[var(--herr-pink)]">{error}</p>
            )}
          </div>
        </div>
      )}

      {!bothConsented && (
        <p className="text-[0.82rem] text-[var(--herr-faint)] italic">
          Please accept both consent statements above to continue.
        </p>
      )}
    </div>
  );
}
