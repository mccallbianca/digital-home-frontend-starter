import { createClient } from '@/lib/supabase/server';

const FALLBACK_MOMENTS = [
  { id: '1', producer_name: 'Lead Producer', track_name: 'Untitled', genre: 'Gospel', activity_mode: 'Healing', caption: 'Why I left the bass open.' },
  { id: '2', producer_name: 'Lead Producer', track_name: 'Untitled', genre: 'Hip Hop', activity_mode: 'Workout', caption: 'Building the track that makes you feel unstoppable.' },
  { id: '3', producer_name: 'Lead Producer', track_name: 'Untitled', genre: 'Latin', activity_mode: 'Morning', caption: 'The guitar tone that feels like a fresh start.' },
];

export default async function MomentForMusic() {
  let moments = FALLBACK_MOMENTS;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('moment_for_music')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true });
    if (data && data.length > 0) moments = data;
  } catch {
    // Use fallback data
  }

  return (
    <section className="px-6 py-24 border-t border-[var(--herr-border)] bg-[var(--herr-surface)]">
      <div className="max-w-[1200px] mx-auto">

        <p className="herr-label text-[var(--herr-muted)] mb-4">A Moment for Music</p>

        <h2 className="font-display text-4xl md:text-5xl font-light text-[var(--herr-white)] mb-6 leading-tight">
          Meet the people behind your soundtrack.
        </h2>

        <p className="text-[var(--herr-muted)] max-w-2xl leading-relaxed mb-14">
          Every track in the HERR catalog was made by a real producer making real decisions — choosing the chord voicing, dialing the 808, finding the guitar tone that feels like home. These are their stories.
        </p>

        {/* Video Grid */}
        <div className="grid md:grid-cols-3 gap-px bg-[var(--herr-border)] mb-12">
          {moments.map((moment) => (
            <div key={moment.id} className="bg-[#111118] flex flex-col">
              {/* Thumbnail placeholder with play button */}
              <div className="relative aspect-video bg-[var(--herr-card)] flex items-center justify-center">
                <svg className="w-14 h-14 text-[var(--herr-magenta)] opacity-80" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="p-6">
                <p className="text-[var(--herr-white)] font-medium mb-1">{moment.producer_name}</p>
                <p className="text-[0.82rem] text-[var(--herr-muted)] mb-2">
                  {moment.track_name} · {moment.genre}
                </p>
                <span className="inline-block herr-label text-[var(--herr-magenta)] border border-[var(--herr-magenta)] px-2 py-0.5 mb-3 text-[0.6rem]">
                  {moment.activity_mode}
                </span>
                <p className="text-[0.85rem] text-[var(--herr-muted)] italic font-display">
                  &ldquo;{moment.caption}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4">
          <a
            href="https://instagram.com/herrbyecqo"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-herr-ghost"
          >
            Watch on Instagram
          </a>
          <a
            href="https://tiktok.com/@herrbyecqo"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-herr-ghost"
          >
            Watch on TikTok
          </a>
        </div>

      </div>
    </section>
  );
}
