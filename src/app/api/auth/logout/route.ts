import { NextResponse } from 'next/server';

import { COOKIE } from '@/lib/spotify/auth';

export const dynamic = 'force-dynamic';

function signOut(request: Request) {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(`${origin}/`, { status: 303 });
  for (const name of Object.values(COOKIE)) {
    response.cookies.set(name, '', { path: '/', maxAge: 0 });
  }
  return response;
}

export async function POST(request: Request) {
  return signOut(request);
}

export async function GET(request: Request) {
  return signOut(request);
}
