import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import {
  COOKIE,
  buildAuthorizeUrl,
  challengeFor,
  createState,
  createVerifier,
  isSpotifyConfigured,
} from '@/lib/spotify/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  if (!isSpotifyConfigured()) {
    return NextResponse.redirect(`${origin}/?error=not_configured`);
  }

  const verifier = createVerifier();
  const state = createState();

  const response = NextResponse.redirect(buildAuthorizeUrl(challengeFor(verifier), state));

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 10,
  };
  response.cookies.set(COOKIE.verifier, verifier, options);
  response.cookies.set(COOKIE.state, state, options);

  // Starting a real connection ends any demo session.
  const jar = await cookies();
  if (jar.get(COOKIE.demo)) response.cookies.delete(COOKIE.demo);

  return response;
}
