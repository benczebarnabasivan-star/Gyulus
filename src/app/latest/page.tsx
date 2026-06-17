import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { Section } from '@/components/ui/Section';
import { TikTokCreatorEmbed } from '@/components/video/TikTokCreatorEmbed';

export const metadata: Metadata = {
  title: 'Élő TikTok feed',
  description:
    'Vadász Gyula legújabb TikTok videói élőben, a TikTok hivatalos beágyazásán keresztül — mindig naprakészen.',
  alternates: { canonical: '/latest' },
};

export default function LatestPage() {
  return (
    <Section
      title={<>🆕 Élő TikTok feed</>}
      subtitle="Vadász Gyula legfrissebb videói közvetlenül a TikTokról, a hivatalos lejátszón keresztül."
    >
      <TikTokCreatorEmbed handle={siteConfig.creatorHandle} />

      <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-brand-muted">
        A feed a TikTok hivatalos beágyazását használja. Ha nem töltődik be (pl.
        sütik letiltása miatt), nyisd meg közvetlenül:{' '}
        <a
          href={siteConfig.tiktokUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand-cyan hover:underline"
        >
          @{siteConfig.creatorHandle} a TikTokon
        </a>
        .
      </p>
    </Section>
  );
}
