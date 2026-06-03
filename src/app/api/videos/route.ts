import { NextRequest, NextResponse } from 'next/server';
import { queryVideos } from '@/lib/services/videoService';
import type { SortKey } from '@/types';

// Rendered per-request (reads search params); CDN caching is handled via the
// Cache-Control header below (s-maxage + stale-while-revalidate).
export const dynamic = 'force-dynamic';

const VALID_SORTS: SortKey[] = ['recent', 'views', 'likes', 'favorites'];

/**
 * GET /api/videos
 * Query params:
 *   sort=recent|views|likes|favorites
 *   funny=1        only "funniest" clips
 *   featured=1     only featured clips
 *   q=...          free-text search
 *   category=...   filter by category
 *   cursor=0       pagination offset
 *   limit=8        page size (max 24)
 */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const sortParam = sp.get('sort') as SortKey | null;
    const sort: SortKey =
      sortParam && VALID_SORTS.includes(sortParam) ? sortParam : 'recent';

    const result = await queryVideos({
      sort,
      funnyOnly: sp.get('funny') === '1',
      featuredOnly: sp.get('featured') === '1',
      search: sp.get('q') ?? undefined,
      category: sp.get('category') ?? undefined,
      cursor: Math.max(0, Number(sp.get('cursor') ?? '0') || 0),
      limit: Math.min(24, Math.max(1, Number(sp.get('limit') ?? '8') || 8)),
    });

    return NextResponse.json(result, {
      headers: {
        'Cache-Control':
          'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error('[GET /api/videos]', err);
    return NextResponse.json(
      { error: 'Nem sikerült betölteni a videókat.' },
      { status: 500 },
    );
  }
}
