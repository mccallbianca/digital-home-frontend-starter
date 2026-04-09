import type { Metadata } from 'next';
import Link from 'next/link';
import MomentForMusic from '@/components/ecqo-sound/MomentForMusic';
import BListSection from '@/components/ecqo-sound/BListSection';

export const metadata: Metadata = {
  title: 'ECQO Sound — Def Jam meets Headspace | HERR',
  description: 'Genre-personalized therapeutic music. Clinically designed. Composed for your nervous system.',
};

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
const PHASE1 = ['Sleep','Morning','Workout'];
const TIERS = [
  { name:'Free', price:'$0', badge:null, pop:false, features:['Browse the HERR platform','Learn about the ECQO clinical framework','Access public journal content'], excluded:['No voice affirmations','No ECQO Sound','No voice cloning'], cta:'Get Started', href:'/signup' },
  { name:'HERR Collective', price:'$9', badge:null, pop:false, features:['Conversational AI (ECQO Screener)','Voice affirmations in text-to-speech','All 8 activity modes','HERR Nation community','Monthly theme drops'], excluded:['No ECQO Sound music layer','No voice cloning'], cta:'Subscribe — $9/mo', href:'/checkout?tier=collective' },
  { name:'HERR Personalized', price:'$19', badge:'Most Popular', pop:true, features:['Everything in Collective','Your own cloned voice via ElevenLabs','Full ECQO Sound — genre selection, playlists, ratings','Personalized existential assessment','Quarterly voice + script refresh'], excluded:[], cta:'Subscribe — $19/mo', href:'/checkout?tier=personalized' },
  { name:'HERR Elite', price:'$29', badge:'Clinical Grade', pop:false, features:['Everything in Personalized','Priority genre access + weekly genre switching','Monthly live session with Bianca D. McCall, LMFT','Elite Lounge + Beta-Testers Lab','Clinically sequenced reprogramming protocol','First access to new features'], excluded:[], cta:'Subscribe — $29/mo', href:'/checkout?tier=elite' },
];

export default async function ECQOSoundPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0F] text-white">
      <section className="relative min-h-screen flex flex-col justify-center px-6 pt-32 pb-24">
        <div className="max-w-[1200px] mx-auto w-full">
          <p className="text-[#C42D8E] uppercase tracking-[0.3em] text-sm font-medium mb-6">ECQO Sound</p>
          <h1 className="text-[clamp(3rem,10vw,8rem)] font-light leading-[0.9] mb-8">Def Jam meets<br/><span className="text-[#C42D8E]">Headspace</span></h1>
          <p className="text-lg md:text-xl text-[#A0A0B0] max-w-xl leading-relaxed mb-10">Genre-personalized therapeutic music. Clinically designed. Composed for your nervous system. Delivered in your genre, every morning.</p>
          <a href="#pricing" className="inline-block bg-[#C42D8E] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#C42D8E]/90 transition-colors">Start Listening</a>
        </div>
      </section>

      <section className="px-6 py-24 border-t border-white/10">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[#A0A0B0] uppercase tracking-[0.3em] text-xs mb-4">The Science</p>
          <h2 className="text-4xl md:text-5xl font-light mb-8">Proprietary formula. Proven results.</h2>
          <p className="text-[#A0A0B0] text-lg leading-relaxed max-w-2xl mb-6">Every ECQO Sound track is built on a proprietary formula combining BPM, frequency tuning, brainwave entrainment, and tonal design — scientifically calibrated to support nervous system regulation and subconscious reprogramming.</p>
          <p className="text-[#A0A0B0] text-lg leading-relaxed max-w-2xl">Each track is personalized to your activity mode, your genre preference, and your clinical profile — so your morning track sounds different from your sleep track, and your workout track hits different from your deep work session. One formula. Infinite expressions.</p>
        </div>
      </section>

      <section className="px-6 py-24 border-t border-white/10 bg-[#111118]">
        <div className="max-w-[800px] mx-auto">
          <p className="text-[#A0A0B0] uppercase tracking-[0.3em] text-xs mb-4">Your Journey</p>
          <h2 className="text-4xl md:text-5xl font-light mb-14">From screener to soundtrack.</h2>
          <div className="flex flex-col gap-8">
            {['Complete your ECQO existential screener','Select your genre and activity mode preferences','Your personalized soundtrack is generated daily','Rate tracks, build playlists, discover new releases weekly','Monthly progress reports track your growth over time'].map((s,i) => (
              <div key={i} className="flex gap-6"><span className="text-[#C42D8E] font-bold text-2xl min-w-[3rem]">{String(i+1).padStart(2,'0')}</span><p className="text-[#A0A0B0] text-lg pt-1">{s}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 border-t border-white/10">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-4xl md:text-5xl font-light mb-6">Eight genres. Eight activity modes.</h2>
          <p className="text-[#A0A0B0] mb-10 max-w-xl">Every genre is composed for every mode — no genre is limited to certain moods.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-12">
            {MODES.map((m) => (<div key={m.name} className="border border-white/10 p-5 hover:border-[#C42D8E] transition-colors"><p className="text-white font-semibold mb-1">{m.name}</p><p className="text-xs text-white/30">{m.tone}</p></div>))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GENRES.map((g) => (<div key={g} className="border border-white/10 p-6 text-center hover:border-[#C42D8E] transition-colors"><p className="text-white font-medium">{g}</p></div>))}
          </div>
        </div>
      </section>

      <section id="pricing" className="px-6 py-24 border-t border-white/10 bg-[#111118]">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-4">Membership</h2>
          <p className="text-[#A0A0B0] text-lg mb-14">Choose your tier.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {TIERS.map((t) => (
              <div key={t.name} className={`flex flex-col p-8 rounded-xl ${t.pop ? 'bg-white text-[#0A0A0F] ring-2 ring-[#C42D8E]' : 'bg-[#0A0A0F] border border-white/10'}`}>
                {t.badge && <p className={`text-xs uppercase tracking-wider font-semibold mb-2 ${t.pop ? 'text-[#C42D8E]' : 'text-[#FFB300]'}`}>{t.badge}</p>}
                <h3 className={`text-xl font-bold mb-2 ${t.pop ? 'text-[#0A0A0F]' : 'text-white'}`}>{t.name}</h3>
                <p className="text-3xl font-bold mb-6">{t.price}<span className="text-sm font-normal opacity-60">/month</span></p>
                <ul className="space-y-2 mb-6 flex-1">
                  {t.features.map((f) => (<li key={f} className="flex items-start gap-2 text-sm"><span className={t.pop ? 'text-[#C42D8E]' : 'text-[#00C853]'}>+</span>{f}</li>))}
                  {t.excluded.map((f) => (<li key={f} className="flex items-start gap-2 text-sm opacity-50"><span>–</span>{f}</li>))}
                </ul>
                <Link href={t.href} className={`block text-center py-3 rounded-full font-semibold transition-colors ${t.pop ? 'bg-[#C42D8E] text-white' : 'border border-white/20 text-white hover:border-[#C42D8E]/50'}`}>{t.cta}</Link>
              </div>
            ))}
          </div>
          <p className="text-white/30 text-sm mt-8">Subscriptions renew automatically each month. Cancel anytime.</p>
        </div>
      </section>

      <MomentForMusic />
      <BListSection />

      <section className="px-6 py-24 border-t border-white/10 text-center">
        <div className="max-w-[800px] mx-auto">
          <p className="text-[#C42D8E] uppercase tracking-[0.3em] text-sm font-medium mb-6">For Producers</p>
          <h2 className="text-4xl md:text-5xl font-light mb-6">Your genre. Their healing. Your legacy.</h2>
          <p className="text-[#A0A0B0] leading-relaxed mb-10 max-w-xl mx-auto">We&apos;re building the world&apos;s first clinically designed music catalog. Independent producers in all eight genres — your compositions become the delivery mechanism for therapeutic change. Original work. Real royalties. Lasting impact.</p>
          <Link href="/ecqo-sound/producers" className="inline-block bg-[#C42D8E] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#C42D8E]/90 transition-colors">Join the Catalog</Link>
        </div>
      </section>
    </main>
  );
}
