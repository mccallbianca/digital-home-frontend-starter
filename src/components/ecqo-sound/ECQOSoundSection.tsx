import Link from 'next/link';

const GENRES = ['Hip Hop','Gospel','R&B/Soul','Lo-fi','Latin','Afrobeats','Classical','Country'];
const MODES = [
  { name: 'Sleep', tone: 'Dissolving, releasing' },
  { name: 'Morning', tone: 'Opening, possibility' },
  { name: 'Workout', tone: 'Power, activation' },
  { name: 'Driving', tone: 'Forward motion, clarity' },
  { name: 'Deep Work', tone: 'Focused, sustained' },
  { name: 'Love+Family', tone: 'Warmth, connection' },
  { name: 'Abundance', tone: 'Expansion, joy' },
  { name: 'Healing', tone: 'Tender, held, safe' },
];

export default function ECQOSoundSection() {
  return (
    <section className="px-6 py-24 border-t border-white/10">
      <div className="max-w-[1200px] mx-auto">
        <p className="text-[#C42D8E] uppercase tracking-[0.3em] text-sm font-medium mb-6">ECQO Sound</p>
        <h2 className="text-4xl md:text-6xl font-light text-white mb-6 leading-tight">Your healing has a soundtrack.</h2>
        <p className="text-lg text-[#A0A0B0] max-w-2xl leading-relaxed mb-16">Genre-personalized therapeutic music composed using a proprietary formula of BPM, frequency, brainwave entrainment, and tonal design — scientifically calibrated to guide your nervous system toward regulation and reprogramming.</p>
        <p className="text-[#A0A0B0] uppercase tracking-[0.3em] text-xs mb-6">Eight Genres</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {GENRES.map((g) => (<div key={g} className="border border-white/10 p-6 text-center hover:border-[#C42D8E] transition-colors"><p className="text-lg font-light text-white">{g}</p></div>))}
        </div>
        <p className="text-xs text-white/30 mb-16">Every genre. Every activity mode. Your soundtrack, your way.</p>
        <p className="text-[#A0A0B0] uppercase tracking-[0.3em] text-xs mb-6">Eight Activity Modes</p>
        <div className="flex flex-wrap gap-3 mb-12">
          {MODES.map((m) => (<div key={m.name} className="border border-white/10 px-4 py-2.5 flex items-center gap-2"><span className="text-sm text-white">{m.name}</span><span className="text-xs text-white/30">{m.tone}</span></div>))}
        </div>
        <Link href="/ecqo-sound" className="inline-block bg-[#C42D8E] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#C42D8E]/90 transition-colors">Unlock ECQO Sound</Link>
      </div>
    </section>
  );
}
