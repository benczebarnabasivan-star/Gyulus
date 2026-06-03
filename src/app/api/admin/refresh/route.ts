import { NextRequest, NextResponse } from 'next/server';
import { invalidateCache } from '@/lib/services/videoService';

export const dynamic = 'force-dynamic';

/** POST /api/admin/refresh — drop the video cache so fresh data is fetched. */
export async function POST(req: NextRequest) {
  const token = (req.headers.get('authorization') ?? '').replace(
    /^Bearer\s+/i,
    '',
  );
  if (!process.env.ADMIN_PASSWORD || token !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Nincs jogosultság.' }, { status: 401 });
  }
  invalidateCache();
  return NextResponse.json({ ok: true });
}
