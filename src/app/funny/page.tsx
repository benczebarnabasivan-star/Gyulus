import type { Metadata } from 'next';
import { Suspense } from 'react';
import type { SortKey } from '@/types';
import { queryVideos } from '@/lib/services/videoService';
import { Section } from '@/components/ui/Section';
import { InfiniteVideoFeed } from '@/components/video/InfiniteVideoFeed';
import { SortTabs } from '@/components/video/SortTabs';

export const metadata: Metadata = {
  title: 'Legviccesebb klipek',
  description:
    'Vadász Gyula legviccesebb és legvirálisabb TikTok klipjei — rendezd a legnézettebb, legkedveltebb vagy közönségkedvenc szerint.',
  alternates: { canonical: '/funny' },
};

export const revalidate = 600;

const SORTS: SortKey[] = ['favorites', 'views', 'likes'];

export default async function FunnyPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const active = (SORTS.includes(sort as SortKey) ? sort : 'favorites') as SortKey;
  const initial = await queryVideos({ funnyOnly: true, sort: active, limit: 8 });

  return (
    <Section
      title={<>😂 Legviccesebb klipek</>}
      subtitle="A legtöbbet nevettető, legvirálisabb pillanatok gyűjteménye."
      action={
        <Suspense fallback={null}>
          <SortTabs options={SORTS} />
        </Suspense>
      }
    >
      <InfiniteVideoFeed
        key={active}
        initial={initial}
        sort={active}
        funnyOnly
      />
    </Section>
  );
}
