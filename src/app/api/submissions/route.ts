import { NextRequest, NextResponse } from 'next/server';
import {
  addSubmission,
  listSubmissions,
  setSubmissionStatus,
  type SubmissionStatus,
} from '@/lib/services/submissionStore';

export const dynamic = 'force-dynamic';

/** GET /api/submissions — list all (used by the admin panel). */
export async function GET() {
  return NextResponse.json({ items: listSubmissions() });
}

/** POST /api/submissions — create a community submission (PENDING). */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tiktokUrl = String(body.tiktokUrl ?? '').trim();
    if (!/tiktok\.com\//i.test(tiktokUrl)) {
      return NextResponse.json(
        { error: 'Érvénytelen TikTok link.' },
        { status: 400 },
      );
    }
    const created = addSubmission({
      tiktokUrl,
      note: body.note ? String(body.note).slice(0, 280) : undefined,
      authorName: body.authorName
        ? String(body.authorName).slice(0, 40)
        : undefined,
    });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Hibás kérés.' }, { status: 400 });
  }
}

/** PATCH /api/submissions — moderate (approve/reject). Admin only. */
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Nincs jogosultság.' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const id = String(body.id ?? '');
    const status = String(body.status ?? '') as SubmissionStatus;
    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json({ error: 'Hibás státusz.' }, { status: 400 });
    }
    const updated = setSubmissionStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: 'Nem található.' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Hibás kérés.' }, { status: 400 });
  }
}

function isAuthorized(req: NextRequest): boolean {
  const header = req.headers.get('authorization') ?? '';
  const token = header.replace(/^Bearer\s+/i, '');
  return !!process.env.ADMIN_PASSWORD && token === process.env.ADMIN_PASSWORD;
}
