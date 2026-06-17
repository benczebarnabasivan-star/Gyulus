import type { Metadata } from 'next';
import Link from 'next/link';
import { getVideos } from '@/lib/services/videoService';
import { siteConfig } from '@/config/site';
import { Section } from '@/components/ui/Section';
import { RealVideoCard } from '@/components/video/RealVideoCard';

export const metadata: Metadata = {
  title: 'Válogatott klipek',
  description:
    'Rajongói válogatás Vadász Gyula valódi, legviccesebb TikTok klipjeiből — a TikTok hivatalos lejátszóján keresztül.',
  alternates: { canonical: '/funny' },
};

export const revalidate = 3600;

export default async function FunnyPage() {
  const videos = await getVideos();

  return (
    <Section
      title={<>😂 Válogatott klipek</>}
      subtitle="Rajongói válogatás Vadász Gyula valódi videóiból. A lejátszás a TikTok hivatalos beágyazásával történik."
    >
      {videos.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {videos.map((v, i) => (
            <RealVideoCard key={v.id} video={v} index={i} />
          ))}
        </div>
      ) : (
        <div className="surface grid place-items-center px-6 py-16 text-center">
          <p className="text-4xl">🎬</p>
          <p className="mt-3 text-lg font-semibold">Hamarosan bővül a válogatás</p>
          <p className="mt-1 max-w-md text-sm text-brand-muted">
            Addig is nézd meg a legfrissebb videókat az élő feedben, vagy a
            TikTokon.
          </p>
          <Link
            href="/latest"
            className="mt-4 rounded-full bg-brand-pink px-5 py-2.5 font-semibold text-white"
          >
            Élő feed
          </Link>
        </div>
      )}

      <p className="mt-8 text-center text-sm text-brand-muted">
        Több valódi videó az{' '}
        <a
          href={siteConfig.tiktokUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand-cyan hover:underline"
        >
          eredeti TikTok csatornán
        </a>
        .
      </p>
    </Section>
  );
}
