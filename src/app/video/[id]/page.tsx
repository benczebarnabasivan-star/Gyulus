import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getRelated, getVideo, getVideos } from '@/lib/services/videoService';
import { absoluteUrl, videoJsonLd } from '@/lib/seo';
import { Section } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { RealVideoCard } from '@/components/video/RealVideoCard';
import { TikTokVideoEmbed } from '@/components/video/TikTokVideoEmbed';
import { ShareButtons } from '@/components/ui/ShareButtons';

interface Params {
  params: Promise<{ id: string }>;
}

export const revalidate = 3600;

// Pre-render the known verified video pages.
export async function generateStaticParams() {
  const videos = await getVideos();
  return videos.map((v) => ({ id: v.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const video = await getVideo(id);
  if (!video) return { title: 'Videó nem található' };

  return {
    title: video.caption,
    description: `${video.caption} — Vadász Gyula valódi TikTok videója.`,
    alternates: { canonical: `/video/${video.id}` },
    openGraph: {
      type: 'video.other',
      url: absoluteUrl(`/video/${video.id}`),
      title: video.caption,
      ...(video.thumbnailUrl
        ? { images: [{ url: video.thumbnailUrl, width: 720, height: 1280 }] }
        : {}),
    },
  };
}

export default async function VideoDetailPage({ params }: Params) {
  const { id } = await params;
  const video = await getVideo(id);
  if (!video) notFound();

  const related = await getRelated(video, 4);
  const shareUrl = absoluteUrl(`/video/${video.id}`);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd(video)) }}
      />

      <Section className="pb-0">
        <Link
          href="/funny"
          className="mb-6 inline-flex items-center gap-1 text-sm text-brand-muted transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Vissza a klipekhez
        </Link>

        <div className="grid gap-10 lg:grid-cols-[384px_1fr]">
          <div>
            <TikTokVideoEmbed
              videoId={video.id}
              caption={video.caption}
              thumbnailUrl={video.thumbnailUrl}
            />
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="cyan">{video.category}</Badge>
              <Badge variant="outline">@{video.authorName}</Badge>
            </div>

            <h1 className="mt-4 text-2xl font-bold leading-snug sm:text-3xl">
              {video.caption}
            </h1>

            {video.note && (
              <p className="mt-3 text-brand-muted">{video.note}</p>
            )}

            <p className="mt-4 text-sm text-brand-muted">
              ℹ️ Ez a valódi TikTok videó a hivatalos lejátszón keresztül jelenik
              meg. A megtekintési és kedvelési számok a TikTokon érhetők el.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-5 py-2.5 font-semibold text-white shadow-glow transition hover:brightness-110"
              >
                Megnyitás TikTokon
              </a>
              <ShareButtons url={shareUrl} title={video.caption} />
            </div>
          </div>
        </div>
      </Section>

      {related.length > 0 && (
        <Section title={<>Kapcsolódó videók</>}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((v, i) => (
              <RealVideoCard key={v.id} video={v} index={i} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
