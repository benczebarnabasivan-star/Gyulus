import { NextResponse } from 'next/server';

import { COOKIE } from '@/lib/spotify/auth';

export const dynamic = 'force-dynamic';

/**
 * Enters demo mode: the app runs against the built-in sample listener so the
 * full experience is explorable without Spotify credentials.
 */
function enterDemo(request: Request) {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(`${origin}/dashboard`, { status: 303 });

  response.cookies.set(COOKIE.demo, '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  return response;
}

export async function POST(request: Request) {
  return enterDemo(request);
}

export async function GET(request: Request) {
  return enterDemo(request);
}
