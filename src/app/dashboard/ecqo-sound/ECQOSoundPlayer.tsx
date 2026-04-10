'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface Track {
  id: string;
  genre: string;
  activity_mode: string;
  title: string | null;
  audio_url: string | null;
  stem_url: string | null;
  clinical_label: string;
  duration_seconds: number | null;
}

interface Affirmation {
  id: string;
  script: string;
  activity_mode: string;
  audio_url: string | null;
  generated_at: string;
}

const MODE_LABELS: Record<string, string> = {
  'workout': 'Workout',
  'driving': 'Driving',
  'sleep': 'Sleep',
  'morning': 'Morning',
  'deep-work': 'Deep Work',
  'love-family': 'Love + Family',
  'abundance': 'Abundance',
  'healing': 'Healing',
};

export default function ECQOSoundPlayer({
  genre,
  modes,
  latestAffirmation,
  tracks,
  userId,
}: {
  genre: string;
  modes: string[];
  latestAffirmation: Affirmation | null;
  tracks: Track[];
  userId: string;
}) {
  const [activeMode, setActiveMode] = useState<string>(modes[0] || 'morning');
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState(0.8);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [ambientVolume, setAmbientVolume] = useState(0.3);
  const [generating, setGenerating] = useState(false);

  const voiceRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const ambientRef = useRef<HTMLAudioElement | null>(null);

  // Find the track for the active mode
  const activeTrack = tracks.find(t => t.activity_mode === activeMode);

  // Update volumes in real time
  useEffect(() => {
    if (voiceRef.current) voiceRef.current.volume = voiceVolume;
  }, [voiceVolume]);
  useEffect(() => {
    if (musicRef.current) musicRef.current.volume = musicVolume;
  }, [musicVolume]);
  useEffect(() => {
    if (ambientRef.current) ambientRef.current.volume = ambientVolume;
  }, [ambientVolume]);

  const stopAll = useCallback(() => {
    [voiceRef, musicRef, ambientRef].forEach(ref => {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    });
    setIsPlaying(false);
  }, []);

  function handlePlayPause() {
    if (isPlaying) {
      stopAll();
      return;
    }

    // Start all available layers simultaneously
    const layers: HTMLAudioElement[] = [];

    // Layer 1: Voice affirmation
    if (latestAffirmation?.audio_url) {
      const voice = new Audio(latestAffirmation.audio_url);
      voice.volume = voiceVolume;
      voice.loop = false;
      voiceRef.current = voice;
      layers.push(voice);
    }

    // Layer 2: Genre-composed therapeutic music
    if (activeTrack?.audio_url) {
      const music = new Audio(activeTrack.audio_url);
      music.volume = musicVolume;
      music.loop = true;
      musicRef.current = music;
      layers.push(music);
    }

    // Layer 3: Ambient frequency stem
    if (activeTrack?.stem_url) {
      const ambient = new Audio(activeTrack.stem_url);
      ambient.volume = ambientVolume;
      ambient.loop = true;
      ambientRef.current = ambient;
      layers.push(ambient);
    }

    if (layers.length === 0) return;

    // Play all layers together
    layers.forEach(audio => audio.play());
    setIsPlaying(true);

    // When voice ends (non-looping), keep music/ambient going
    if (voiceRef.current) {
      voiceRef.current.onended = () => {
        voiceRef.current = null;
      };
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch('/api/affirmations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, activityMode: activeMode }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } finally {
      setGenerating(false);
    }
  }

  const allModes = modes.length > 0 ? modes : Object.keys(MODE_LABELS);

  return (
    <div>
      {/* Mode selector */}
      <p className="herr-label text-[var(--herr-muted)] mb-4">Activity Mode</p>
      <div className="flex flex-wrap gap-2 mb-10">
        {allModes.map(mode => (
          <button
            key={mode}
            onClick={() => { stopAll(); setActiveMode(mode); }}
            className={`px-4 py-2 text-sm border transition-colors ${
              activeMode === mode
                ? 'border-[var(--herr-pink)] text-[var(--herr-pink)] bg-[rgba(217,70,239,0.06)]'
                : 'border-[var(--herr-border)] text-[var(--herr-muted)] hover:border-[var(--herr-pink)]'
            }`}
          >
            {MODE_LABELS[mode] || mode}
          </button>
        ))}
      </div>

      {/* Now playing display */}
      <div className="border border-[var(--herr-border)] bg-[var(--herr-surface)] p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="herr-label text-[var(--herr-pink)] mb-2">Now Playing</p>
            <h2 className="font-display text-2xl font-light text-[var(--herr-white)]">
              {MODE_LABELS[activeMode] || activeMode} — {genre}
            </h2>
          </div>

          {/* Play/Stop button */}
          <button
            onClick={handlePlayPause}
            disabled={!latestAffirmation?.audio_url && !activeTrack?.audio_url}
            className={`w-16 h-16 border-2 flex items-center justify-center transition-colors ${
              isPlaying
                ? 'border-[var(--herr-pink)] text-[var(--herr-pink)]'
                : 'border-[var(--herr-cobalt)] text-[var(--herr-cobalt)] hover:border-[var(--herr-pink)] hover:text-[var(--herr-pink)]'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Three-layer indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--herr-border)]">
          {/* Layer 1: Voice */}
          <div className="bg-[var(--herr-black)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2 h-2 rounded-full ${latestAffirmation?.audio_url ? 'bg-[var(--herr-cobalt)]' : 'bg-[var(--herr-faint)]'}`} />
              <p className="herr-label text-[var(--herr-muted)]">Layer 1 — Voice</p>
            </div>
            <p className="text-[0.82rem] text-[var(--herr-white)] mb-3">
              {latestAffirmation?.audio_url ? 'Your I AM declarations' : 'No voice affirmation yet'}
            </p>
            <label className="flex items-center gap-3">
              <span className="text-[0.7rem] text-[var(--herr-faint)] w-12">Vol</span>
              <input
                type="range"
                min={0} max={1} step={0.05}
                value={voiceVolume}
                onChange={e => setVoiceVolume(parseFloat(e.target.value))}
                className="flex-1 accent-[var(--herr-cobalt)]"
              />
            </label>
          </div>

          {/* Layer 2: Music */}
          <div className="bg-[var(--herr-black)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2 h-2 rounded-full ${activeTrack?.audio_url ? 'bg-[var(--herr-pink)]' : 'bg-[var(--herr-faint)]'}`} />
              <p className="herr-label text-[var(--herr-muted)]">Layer 2 — Music</p>
            </div>
            <p className="text-[0.82rem] text-[var(--herr-white)] mb-3">
              {activeTrack?.title || (activeTrack?.audio_url ? `${genre} — ${MODE_LABELS[activeMode]}` : 'No track available')}
            </p>
            <label className="flex items-center gap-3">
              <span className="text-[0.7rem] text-[var(--herr-faint)] w-12">Vol</span>
              <input
                type="range"
                min={0} max={1} step={0.05}
                value={musicVolume}
                onChange={e => setMusicVolume(parseFloat(e.target.value))}
                className="flex-1 accent-[var(--herr-pink)]"
              />
            </label>
          </div>

          {/* Layer 3: Ambient */}
          <div className="bg-[var(--herr-black)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2 h-2 rounded-full ${activeTrack?.stem_url ? 'bg-[var(--herr-violet)]' : 'bg-[var(--herr-faint)]'}`} />
              <p className="herr-label text-[var(--herr-muted)]">Layer 3 — Ambient</p>
            </div>
            <p className="text-[0.82rem] text-[var(--herr-white)] mb-3">
              {activeTrack?.stem_url ? `${activeTrack.clinical_label} frequency layer` : 'No ambient layer'}
            </p>
            <label className="flex items-center gap-3">
              <span className="text-[0.7rem] text-[var(--herr-faint)] w-12">Vol</span>
              <input
                type="range"
                min={0} max={1} step={0.05}
                value={ambientVolume}
                onChange={e => setAmbientVolume(parseFloat(e.target.value))}
                className="flex-1 accent-[var(--herr-violet)]"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Generate button if no affirmation exists */}
      {!latestAffirmation?.audio_url && (
        <div className="border border-[var(--herr-border)] border-l-2 border-l-[var(--herr-violet)] p-6 mb-8">
          <p className="text-[var(--herr-muted)] text-sm mb-4">
            Generate your first voice affirmation for this mode to unlock the full 3-layer experience.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-herr-primary !text-[0.75rem] disabled:opacity-50"
          >
            {generating ? 'Generating...' : `Generate ${MODE_LABELS[activeMode]} Affirmation`}
          </button>
        </div>
      )}

      {/* Track catalog for this genre */}
      {tracks.length > 0 && (
        <div>
          <p className="herr-label text-[var(--herr-muted)] mb-4">Available Tracks — {genre}</p>
          <div className="space-y-px">
            {tracks.map(track => (
              <div
                key={track.id}
                className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                  activeMode === track.activity_mode
                    ? 'bg-[rgba(217,70,239,0.04)] border-l-2 border-l-[var(--herr-pink)]'
                    : 'bg-[var(--herr-surface)]'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--herr-white)] text-sm">
                    {track.title || `${genre} — ${MODE_LABELS[track.activity_mode] || track.activity_mode}`}
                  </p>
                  <p className="text-[0.75rem] text-[var(--herr-faint)]">
                    {MODE_LABELS[track.activity_mode] || track.activity_mode}
                    {track.duration_seconds ? ` · ${Math.floor(track.duration_seconds / 60)}:${String(track.duration_seconds % 60).padStart(2, '0')}` : ''}
                  </p>
                </div>
                <span className="herr-label text-[0.65rem] text-[var(--herr-faint)]">
                  {track.clinical_label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tracks.length === 0 && (
        <div className="border border-[var(--herr-border)] border-l-2 border-l-[var(--herr-cobalt)] p-6">
          <p className="herr-label text-[var(--herr-cobalt)] mb-2">Coming Soon</p>
          <p className="text-[var(--herr-muted)] text-sm">
            ECQO Sound tracks for {genre} are being composed. Your voice affirmations are available now — genre tracks will be added as producers deliver their compositions.
          </p>
        </div>
      )}
    </div>
  );
}
