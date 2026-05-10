'use client';

import { useState, useRef } from 'react';
import ECQOSoundPlayer from '../ecqo-sound/ECQOSoundPlayer';

type Plan = 'collective' | 'personalized' | 'elite';

interface Track {
  id: string;
  script: string;
  activity_mode: string;
  audio_url: string | null;
  generated_at: string;
  delivered: boolean;
}

interface SoundTrack {
  id: string;
  genre: string;
  activity_mode: string;
  title: string | null;
  audio_url: string | null;
  stem_url: string | null;
  clinical_label: string;
  duration_seconds: number | null;
}

interface LatestAffirmation {
  id: string;
  script: string;
  activity_mode: string;
  audio_url: string | null;
  generated_at: string;
}

interface AffirmationsClientProps {
  userId: string;
  plan: Plan;
  selectedModes: string[];
  tracks: Track[];
  genre: string;
  latestAffirmation: LatestAffirmation | null;
  soundTracks: SoundTrack[];
}

const CARD_BASE: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid rgba(26,15,26,0.08)',
  borderRadius: 16,
  padding: 28,
  marginBottom: 16,
};

export default function AffirmationsClient({
  userId,
  plan,
  selectedModes,
  tracks,
  genre,
  latestAffirmation,
  soundTracks,
}: AffirmationsClientProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [showCount, setShowCount] = useState(10);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const hasLayered = plan === 'personalized' || plan === 'elite';
  const voiceLabel = hasLayered ? 'Your Voice' : "Bianca's Voice";

  const todayStr = today.toISOString().split('T')[0];
  const todayTracks = tracks.filter((t) => t.generated_at?.startsWith(todayStr));
  const archiveTracks = tracks.filter((t) => !t.generated_at?.startsWith(todayStr));
  const filteredArchive =
    filter === 'all' ? archiveTracks : archiveTracks.filter((t) => t.activity_mode === filter);

  const playTrack = (track: Track) => {
    if (!track.audio_url) return;
    if (playingId === track.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(track.audio_url);
    audioRef.current = audio;
    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
      setTotalTime(audio.duration || 0);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    audio.onended = () => {
      setPlayingId(null);
      setProgress(0);
    };
    audio.play();
    setPlayingId(track.id);
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  };

  const renderVoiceOnlyCard = (track: Track) => {
    const isPlaying = playingId === track.id;
    const isExpanded = expandedId === track.id;
    const mode = track.activity_mode?.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Morning';
    const preview = track.script?.slice(0, 120) + (track.script?.length > 120 ? '...' : '');

    return (
      <div key={track.id} style={CARD_BASE}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span
            style={{
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--herr-magenta)',
              border: '1px solid var(--herr-magenta)',
              padding: '4px 12px',
              borderRadius: 12,
            }}
          >
            {mode}
          </span>
          <span style={{ fontSize: 11, color: 'rgba(26,15,26,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Voice Only · {voiceLabel}
          </span>
        </div>

        <p
          onClick={() => setExpandedId(isExpanded ? null : track.id)}
          style={{
            fontSize: 17,
            color: 'rgba(26,15,26,0.85)',
            fontStyle: 'italic',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            lineHeight: 1.6,
            marginBottom: 20,
            cursor: 'pointer',
          }}
        >
          &ldquo;{isExpanded ? track.script : preview}&rdquo;
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => playTrack(track)}
            disabled={!track.audio_url}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: track.audio_url ? 'var(--herr-magenta)' : 'rgba(196,45,142,0.3)',
              border: 'none',
              cursor: track.audio_url ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--herr-cream)">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--herr-cream)">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ width: '100%', height: 4, background: 'rgba(26,15,26,0.08)', borderRadius: 2, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  background: 'var(--herr-magenta)',
                  borderRadius: 2,
                  width: isPlaying ? `${progress}%` : '0%',
                  transition: 'width 200ms linear',
                }}
              />
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'rgba(26,15,26,0.4)', flexShrink: 0 }}>
            {isPlaying ? `${formatTime(currentTime)} / ${formatTime(totalTime)}` : formatTime(totalTime)}
          </span>
        </div>
      </div>
    );
  };

  // Personalized + Elite tier: full ECQOSoundPlayer embedded inline (Override 1).
  const renderLayeredSection = () => (
    <section
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(26,15,26,0.08)',
        borderRadius: 16,
        padding: 28,
        marginTop: 24,
        marginBottom: 16,
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <p
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--herr-magenta)',
            marginBottom: 6,
          }}
        >
          ECQO Sound Healing · Three-Layer · v3 Spec
        </p>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 26,
            fontWeight: 500,
            color: 'var(--herr-ink)',
            margin: 0,
          }}
        >
          Today&apos;s Layered Session
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(26,15,26,0.6)', lineHeight: 1.5, marginTop: 6 }}>
          Voice affirmation layered with composed therapeutic music and Solfeggio 174Hz frequency.
          Adjust each layer below.
        </p>
      </div>
      <ECQOSoundPlayer
        genre={genre}
        modes={selectedModes}
        latestAffirmation={latestAffirmation}
        tracks={soundTracks}
        userId={userId}
      />
    </section>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--herr-cream)', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--herr-magenta)', marginBottom: 8 }}>
          MY AFFIRMATIONS
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32, fontWeight: 500, color: 'var(--herr-ink)', marginBottom: 4 }}>
          Today&apos;s Reprogramming
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(26,15,26,0.55)', marginBottom: 32 }}>{dateStr}</p>

        {todayTracks.length > 0 ? (
          todayTracks.map(renderVoiceOnlyCard)
        ) : (
          <div style={{ ...CARD_BASE, textAlign: 'center' }}>
            <p style={{ fontSize: 16, color: 'rgba(26,15,26,0.65)' }}>
              Your affirmations for today are being generated...
            </p>
            <p style={{ fontSize: 13, color: 'rgba(26,15,26,0.45)', marginTop: 8 }}>
              Check back soon. New affirmations are delivered daily based on your assessment and activity modes.
            </p>
          </div>
        )}

        {hasLayered && renderLayeredSection()}

        {archiveTracks.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(26,15,26,0.08)', paddingTop: 32, marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(26,15,26,0.55)' }}>
                ARCHIVE
              </p>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(26,15,26,0.12)',
                  borderRadius: 8,
                  padding: '6px 12px',
                  color: 'var(--herr-ink)',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                <option value="all">All Modes</option>
                {selectedModes.map((m) => (
                  <option key={m} value={m}>
                    {m.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {filteredArchive.slice(0, showCount).map((track) => {
              const mode = track.activity_mode?.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '';
              const date = track.generated_at
                ? new Date(track.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : '';
              const excerpt = track.script?.slice(0, 60) + '...';
              return (
                <div
                  key={track.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 12,
                    padding: '14px 20px',
                    border: '1px solid rgba(26,15,26,0.08)',
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: 'rgba(26,15,26,0.55)' }}>{date}</span>
                      <span
                        style={{
                          fontSize: 10,
                          color: 'var(--herr-magenta)',
                          border: '1px solid var(--herr-magenta)',
                          padding: '2px 8px',
                          borderRadius: 8,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {mode}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: 'rgba(26,15,26,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                      {excerpt}
                    </p>
                  </div>
                  <button
                    onClick={() => playTrack(track)}
                    disabled={!track.audio_url}
                    aria-label="Play"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: track.audio_url ? 'var(--herr-magenta)' : 'rgba(196,45,142,0.3)',
                      border: 'none',
                      cursor: track.audio_url ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--herr-cream)">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              );
            })}

            {filteredArchive.length > showCount && (
              <button
                onClick={() => setShowCount((prev) => prev + 10)}
                style={{
                  display: 'block',
                  margin: '16px auto',
                  height: 40,
                  padding: '0 24px',
                  background: 'transparent',
                  color: 'var(--herr-ink)',
                  borderRadius: 12,
                  border: '1px solid rgba(26,15,26,0.18)',
                  fontSize: 13,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                }}
              >
                Load More
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
