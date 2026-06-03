import { NextRequest, NextResponse } from 'next/server';
import { queryVideos } from '@/lib/services/videoService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/search?q=…
 * Lightweight search endpoint (captions, keywords, categories). Used for
 * type-ahead/autocomplete; returns up to 8 matches.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) {
    return NextResponse.json({ items: [], nextCursor: null, total: 0 });
  }
  try {
    const result = await queryVideos({ search: q, sort: 'views', limit: 8 });
    return NextResponse.json(result);
  } catch (err) {
    console.error('[GET /api/search]', err);
    return NextResponse.json({ error: 'Keresési hiba.' }, { status: 500 });
  }
}
