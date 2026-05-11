'use client';

import { useState, useRef } from 'react';

interface Track {
  id: string;
  script: string;
  activity_mode: string;
  audio_url: string | null;
  generated_at: string;
  delivered: boolean;
}

export default function AffirmationPlayer({
  tracks,
  userId,
}: {
  tracks: Track[];
  userId: string;
}) {
  const [playing, setPlaying] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const MODE_LABELS: Record<string, string> = {
    'workout': 'Workout', 'driving': 'Driving', 'sleep': 'Sleep',
    'morning': 'Morning', 'deep-work': 'Deep Work',
    'love-family': 'Love + Family', 'abundance': 'Abundance', 'healing': 'Healing',
  };

  function handlePlay(track: Track) {
    if (!track.audio_url) return;

    if (playing === track.id) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(track.audio_url);
    audio.onended = () => setPlaying(null);
    audio.play();
    audioRef.current = audio;
    setPlaying(track.id);
  }

  async function handleGenerate(mode: string) {
    setGenerating(mode);
    try {
      const res = await fetch('/api/affirmations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, activityMode: mode }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } finally {
      setGenerating(null);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  if (tracks.length === 0) {
    return (
      <div className="border border-[var(--herr-border)] border-l-2 border-l-[var(--herr-violet)] p-8">
        <p className="herr-label text-[var(--herr-violet)] mb-3">No Affirmations Yet</p>
        <p className="text-[var(--herr-muted)] leading-relaxed mb-6">
          Your personalized affirmation library will be populated after your first delivery.
          You can also generate one now for any activity mode.
        </p>
        <div className="flex flex-wrap gap-3">
          {Object.entries(MODE_LABELS).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => handleGenerate(mode)}
              disabled={!!generating}
              className="btn-herr-ghost !py-2 !px-4 !text-[0.7rem] disabled:opacity-40"
            >
              {generating === mode ? 'Generating...' : `Generate ${label}`}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tracks.map((track, i) => {
        const isPlaying = playing === track.id;
        const isExpanded = expanded === track.id;
        const isNew = i === 0;

        return (
          <div
            key={track.id}
            className={`border transition-colors ${
              isNew
                ? 'border-[var(--herr-pink)] bg-[rgba(217,70,239,0.04)]'
                : 'border-[var(--herr-border)] bg-[var(--herr-surface)]'
            }`}
          >
            {/* Track header */}
            <div className="flex items-center gap-4 px-6 py-4">
              {/* Play button */}
              <button
                onClick={() => handlePlay(track)}
                disabled={!track.audio_url}
                className={`w-10 h-10 shrink-0 border flex items-center justify-center transition-colors ${
                  track.audio_url
                    ? 'border-[var(--herr-pink)] text-[var(--herr-pink)] hover:bg-[var(--herr-pink-dim)]'
                    : 'border-[var(--herr-border)] text-[var(--herr-faint)] cursor-not-allowed'
                }`}
              >
                {isPlaying ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Track info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <p className="text-[var(--herr-white)] text-sm font-medium truncate">
                    {MODE_LABELS[track.activity_mode] || track.activity_mode} Affirmation
                  </p>
                  {isNew && (
                    <span className="herr-label text-[var(--herr-pink)] text-[0.6rem]">NEW</span>
                  )}
                </div>
                <p className="text-[0.75rem] text-[var(--herr-faint)]">
                  {formatDate(track.generated_at)}
                  {!track.audio_url && ' · Audio generating...'}
                </p>
              </div>

              {/* Expand button */}
              <button
                onClick={() => setExpanded(isExpanded ? null : track.id)}
                className="text-[var(--herr-muted)] hover:text-[var(--herr-white)] transition-colors"
              >
                <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>

            {/* Expanded script text */}
            {isExpanded && (
              <div className="px-6 pb-5 border-t border-[var(--herr-border)]">
                <p className="herr-label text-[var(--herr-muted)] mt-4 mb-3">Script</p>
                <div className="text-[0.85rem] text-[var(--herr-muted)] leading-relaxed whitespace-pre-wrap">
                  {track.script}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
