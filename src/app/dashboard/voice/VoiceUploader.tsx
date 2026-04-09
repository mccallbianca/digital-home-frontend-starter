'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/browser';

const VOICE_SCRIPT =
  'I am present. I am powerful. I am evolving. My inner voice is my greatest asset. I choose growth. I choose healing. I choose to become who I was always meant to be.';

export default function VoiceUploader({ userId, hasExisting }: { userId: string; hasExisting: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!file) return;
    setError('');
    setUploading(true);

    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() ?? 'mp3';
      const path = `${userId}/sample.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('voice-samples')
        .upload(path, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      await supabase.from('voice_consents').upsert({
        user_id: userId,
        consented_at: new Date().toISOString(),
        file_path: path,
      }, { onConflict: 'user_id' });

      setUploaded(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    setError('');
    if (!selected) return;
    if (selected.size > 25 * 1024 * 1024) {
      setError('File must be under 25MB.');
      return;
    }
    setFile(selected);
    setUploaded(false);
  }

  return (
    <div>
      {/* Script reference */}
      <div className="mb-6 p-4 border border-[var(--herr-border)] bg-[var(--herr-black)]">
        <p className="herr-label text-[var(--herr-cobalt)] mb-2">Recording Script</p>
        <p className="font-display text-[var(--herr-muted)] italic leading-relaxed">
          &ldquo;{VOICE_SCRIPT}&rdquo;
        </p>
      </div>

      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-[var(--herr-border-mid)] p-8 text-center cursor-pointer hover:border-[var(--herr-cobalt)] transition-colors mb-4"
      >
        <input
          ref={fileRef}
          type="file"
          accept=".mp3,.wav,.m4a"
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
            <p className="text-[var(--herr-muted)] mb-1">
              {hasExisting ? 'Click to select a new file' : 'Click to select a file'}
            </p>
            <p className="text-[0.75rem] text-[var(--herr-faint)]">.mp3, .wav, or .m4a — max 25MB</p>
          </div>
        )}
      </div>

      {file && !uploaded && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="btn-herr-primary disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : hasExisting ? 'Replace Voice Sample' : 'Upload Voice Sample'}
        </button>
      )}

      {uploaded && (
        <div className="p-4 border border-[var(--herr-cobalt)] bg-[var(--herr-surface)]">
          <p className="text-[var(--herr-cobalt)] text-sm font-medium">Voice sample uploaded successfully.</p>
        </div>
      )}

      {error && <p className="mt-3 text-[0.78rem] text-[var(--herr-pink)]">{error}</p>}
    </div>
  );
}
