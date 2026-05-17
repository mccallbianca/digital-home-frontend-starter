import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import HomeHero from '@/components/home/HomeHero';
import HomeGap from '@/components/home/HomeGap';
import HomeHowItFeels from '@/components/home/HomeHowItFeels';
import HomeWhoIs from '@/components/home/HomeWhoIs';
import HomeEcqoSound from '@/components/home/HomeEcqoSound';
import HomeWhoFor from '@/components/home/HomeWhoFor';
import HomeScience from '@/components/home/HomeScience';
import HomeMembership from '@/components/home/HomeMembership';
import HomeInvitation from '@/components/home/HomeInvitation';

export const metadata: Metadata = {
  description:
    "HERR (Human Existential Regulator and Reprogramming) is the Quiet Professional for high-achievers stuck in the Gap. A clinical wellness operating system that regulates the nervous system first, then reprograms the inner voice. Designed by Bianca D. McCall, M.A., LMFT.",
};

export default function HomePage() {
  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'HERR | Human Existential Regulator and Reprogramming',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    url: 'https://h3rr.com',
    description:
      'A clinical wellness operating system that delivers personalized voice affirmations in your own cloned voice. Regulate first. Reprogram second.',
    creator: {
      '@type': 'Person',
      name: 'Bianca D. McCall, M.A., LMFT',
      jobTitle: 'Licensed Marriage and Family Therapist',
    },
    offers: [
      { '@type': 'Offer', name: 'HERR Collective', price: '9', priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'HERR Personalized', price: '19', priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'HERR Elite', price: '29', priceCurrency: 'USD' },
    ],
  };

  return (
    <main className="home-page">
      <JsonLd data={softwareAppSchema} />
      <HomeHero />
      <HomeGap />
      <HomeHowItFeels />
      <HomeWhoIs />
      <HomeEcqoSound />
      <HomeWhoFor />
      <HomeScience />
      <HomeMembership />
      <HomeInvitation />
    </main>
  );
}
