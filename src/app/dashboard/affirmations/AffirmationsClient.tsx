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

interface AffirmationsClientProps {
  userId: string;
  hasVoice: boolean;
  selectedModes: string[];
  tracks: Track[];
}

export default function AffirmationsClient({ hasVoice, selectedModes, tracks }: AffirmationsClientProps) {
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

  const voiceLabel = hasVoice ? 'Your Voice' : "Bianca's Voice";

  // Split: today's tracks vs archive
  const todayStr = today.toISOString().split('T')[0];
  const todayTracks = tracks.filter(t => t.generated_at?.startsWith(todayStr));
  const archiveTracks = tracks.filter(t => !t.generated_at?.startsWith(todayStr));
  const filteredArchive = filter === 'all' ? archiveTracks : archiveTracks.filter(t => t.activity_mode === filter);

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
    audio.onended = () => { setPlayingId(null); setProgress(0); };
    audio.play();
    setPlayingId(track.id);
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  };

  const renderPlayer = (track: Track) => {
    const isPlaying = playingId === track.id;
    const isExpanded = expandedId === track.id;
    const mode = track.activity_mode?.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Morning';
    const preview = track.script?.slice(0, 120) + (track.script?.length > 120 ? '...' : '');

    return (
      <div
        key={track.id}
        style={{
          background: '#16161F',
          borderRadius: 16,
          padding: 32,
          border: '1px solid rgba(255,255,255,0.08)',
          marginBottom: 16,
        }}
      >
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{
            fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px',
            color: '#C42D8E', border: '1px solid #C42D8E', padding: '4px 12px', borderRadius: 12,
          }}>
            {mode}
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{voiceLabel}</span>
        </div>

        {/* Text */}
        <p
          onClick={() => setExpandedId(isExpanded ? null : track.id)}
          style={{
            fontSize: 16, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic',
            fontFamily: "'Cormorant Garamond', Georgia, serif", lineHeight: 1.6,
            marginBottom: 16, cursor: 'pointer',
          }}
        >
          &ldquo;{isExpanded ? track.script : preview}&rdquo;
        </p>

        {/* Audio player */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => playTrack(track)}
            disabled={!track.audio_url}
            style={{
              width: 48, height: 48, borderRadius: '50%',
              background: track.audio_url ? '#C42D8E' : 'rgba(196,45,142,0.3)',
              border: 'none', cursor: track.audio_url ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFF"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFF"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#C42D8E', borderRadius: 2, width: isPlaying ? `${progress}%` : '0%', transition: 'width 200ms linear' }} />
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
            {isPlaying ? `${formatTime(currentTime)} / ${formatTime(totalTime)}` : formatTime(totalTime)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', padding: '80px 24px 60px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '2px', color: '#C42D8E', marginBottom: 8 }}>
          MY AFFIRMATIONS
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>
          Today&apos;s Reprogramming
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>{dateStr}</p>

        {/* Today's tracks */}
        {todayTracks.length > 0 ? (
          todayTracks.map(renderPlayer)
        ) : (
          <div style={{ background: '#16161F', borderRadius: 16, padding: 32, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', marginBottom: 32 }}>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>
              Your affirmations for today are being generated...
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
              Check back soon. New affirmations are delivered daily based on your assessment and activity modes.
            </p>
          </div>
        )}

        {/* Archive */}
        {archiveTracks.length > 0 && (
          <>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 32, marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.4)' }}>
                  ARCHIVE
                </p>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  style={{
                    background: '#16161F', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 8, padding: '6px 12px', color: 'rgba(255,255,255,0.6)',
                    fontSize: 13, cursor: 'pointer',
                  }}
                >
                  <option value="all">All Modes</option>
                  {selectedModes.map(m => (
                    <option key={m} value={m}>{m.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </select>
              </div>

              {filteredArchive.slice(0, showCount).map((track) => {
                const mode = track.activity_mode?.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';
                const date = track.generated_at ? new Date(track.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
                const excerpt = track.script?.slice(0, 60) + '...';
                return (
                  <div
                    key={track.id}
                    style={{
                      background: '#16161F', borderRadius: 12, padding: '16px 24px',
                      border: '1px solid rgba(255,255,255,0.08)', marginBottom: 8,
                      display: 'flex', alignItems: 'center', gap: 16,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>{date}</span>
                        <span style={{ fontSize: 11, color: '#C42D8E', border: '1px solid #C42D8E', padding: '2px 8px', borderRadius: 8 }}>{mode}</span>
                      </div>
                      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{excerpt}</p>
                    </div>
                    <button
                      onClick={() => playTrack(track)}
                      disabled={!track.audio_url}
                      style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: track.audio_url ? '#C42D8E' : 'rgba(196,45,142,0.3)',
                        border: 'none', cursor: track.audio_url ? 'pointer' : 'default',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFF"><path d="M8 5v14l11-7z" /></svg>
                    </button>
                  </div>
                );
              })}

              {filteredArchive.length > showCount && (
                <button
                  onClick={() => setShowCount(prev => prev + 10)}
                  style={{
                    display: 'block', margin: '16px auto', height: 40, padding: '0 24px',
                    background: 'transparent', color: '#FFFFFF', borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.3)', fontSize: 13, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer',
                  }}
                >
                  Load More
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
