import type { Metadata } from 'next';
import { Suspense } from 'react';
import { queryVideos } from '@/lib/services/videoService';
import { Section } from '@/components/ui/Section';
import { InfiniteVideoFeed } from '@/components/video/InfiniteVideoFeed';
import { SearchBar } from '@/components/search/SearchBar';

export const metadata: Metadata = {
  title: 'Legújabb videók',
  description:
    'Vadász Gyula legújabb TikTok videói egy helyen — automatikusan frissülő lista, végtelen görgetéssel.',
  alternates: { canonical: '/latest' },
};

export const revalidate = 600;

export default async function LatestPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const search = q?.trim() || undefined;
  const initial = await queryVideos({ sort: 'recent', search, limit: 8 });

  return (
    <Section
      title={search ? <>Keresés: „{search}&rdquo;</> : <>🆕 Legújabb videók</>}
      subtitle={
        search
          ? `${initial.total} találat a videók, feliratok és kulcsszavak között.`
          : 'A legfrissebb feltöltések — görgess a többiért.'
      }
    >
      <div className="mb-8 max-w-xl">
        <Suspense fallback={null}>
          <SearchBar />
        </Suspense>
      </div>

      {/* `key` forces the feed to reset when the search term changes. */}
      <InfiniteVideoFeed key={search ?? 'all'} initial={initial} sort="recent" search={search} />
    </Section>
  );
}
