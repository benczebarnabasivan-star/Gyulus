import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, Heart, MessageCircle, Share2 } from 'lucide-react';
import { getRelated, getVideo, queryVideos } from '@/lib/services/videoService';
import { absoluteUrl, videoJsonLd } from '@/lib/seo';
import { formatCount, formatDateHu, timeAgoHu } from '@/lib/utils';
import { Section } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { VideoGrid } from '@/components/video/VideoGrid';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { ShareButtons } from '@/components/ui/ShareButtons';

interface Params {
  params: Promise<{ id: string }>;
}

// Pre-render all known video pages at build time.
export async function generateStaticParams() {
  const { items } = await queryVideos({ limit: 1000 });
  return items.map((v) => ({ id: v.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const video = await getVideo(id);
  if (!video) return { title: 'Videó nem található' };

  const url = absoluteUrl(`/video/${video.id}`);
  return {
    title: video.caption,
    description: `${video.caption} — Vadász Gyula TikTok videó. ${formatCount(
      video.stats.views,
    )} megtekintés.`,
    alternates: { canonical: `/video/${video.id}` },
    openGraph: {
      type: 'video.other',
      url,
      title: video.caption,
      images: [{ url: video.thumbnailUrl, width: 720, height: 1280 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: video.caption,
      images: [video.thumbnailUrl],
    },
  };
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="surface flex flex-col items-center gap-1 p-4 text-center">
      <span className="text-brand-pink">{icon}</span>
      <span className="text-xl font-bold">{value}</span>
      <span className="text-xs text-brand-muted">{label}</span>
    </div>
  );
}

export default async function VideoDetailPage({ params }: Params) {
  const { id } = await params;
  const video = await getVideo(id);
  if (!video) notFound();

  const related = await getRelated(video, 4);
  const shareUrl = absoluteUrl(`/video/${video.id}`);

  return (
    <>
      {/* VideoObject structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(videoJsonLd(video)),
        }}
      />

      <Section className="pb-0">
        <Link
          href="/latest"
          className="mb-6 inline-flex items-center gap-1 text-sm text-brand-muted transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Vissza a videókhoz
        </Link>

        <div className="grid gap-10 lg:grid-cols-[384px_1fr]">
          {/* Player */}
          <div>
            <VideoPlayer video={video} />
          </div>

          {/* Details */}
          <div>
            <div className="flex flex-wrap gap-2">
              {video.funny && <Badge variant="pink">😂 Vicces</Badge>}
              {video.featured && <Badge variant="cyan">⭐ Kiemelt</Badge>}
              {video.categories.map((c) => (
                <Badge key={c} variant="outline">
                  {c}
                </Badge>
              ))}
            </div>

            <h1 className="mt-4 text-2xl font-bold leading-snug sm:text-3xl">
              {video.caption}
            </h1>

            <p className="mt-2 text-sm text-brand-muted">
              Feltöltve: {formatDateHu(video.uploadedAt)} · {timeAgoHu(video.uploadedAt)}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat icon={<Eye className="h-5 w-5" />} label="Megtekintés" value={formatCount(video.stats.views)} />
              <Stat icon={<Heart className="h-5 w-5" />} label="Kedvelés" value={formatCount(video.stats.likes)} />
              <Stat icon={<MessageCircle className="h-5 w-5" />} label="Komment" value={formatCount(video.stats.comments)} />
              <Stat icon={<Share2 className="h-5 w-5" />} label="Megosztás" value={formatCount(video.stats.shares)} />
            </div>

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

            {video.keywords.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {video.keywords.map((k) => (
                  <span key={k} className="text-sm text-brand-cyan">
                    #{k}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>

      {related.length > 0 && (
        <Section title={<>Kapcsolódó videók</>}>
          <VideoGrid videos={related} priorityCount={0} />
        </Section>
      )}
    </>
  );
}
