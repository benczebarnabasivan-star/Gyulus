import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { COOKIE, exchangeCode, safeEqual } from '@/lib/spotify/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const denied = url.searchParams.get('error');

  if (denied) {
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(denied)}`);
  }

  const jar = await cookies();
  const verifier = jar.get(COOKIE.verifier)?.value;
  const expectedState = jar.get(COOKIE.state)?.value;

  if (!code || !state || !verifier || !expectedState || !safeEqual(state, expectedState)) {
    return NextResponse.redirect(`${origin}/?error=state_mismatch`);
  }

  try {
    const tokens = await exchangeCode(code, verifier);

    const response = NextResponse.redirect(`${origin}/dashboard`);
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    };

    response.cookies.set(COOKIE.accessToken, tokens.access_token, options);
    response.cookies.set(COOKIE.expiresAt, String(Date.now() + tokens.expires_in * 1000), options);
    if (tokens.refresh_token) {
      response.cookies.set(COOKIE.refreshToken, tokens.refresh_token, options);
    }

    // One-shot values — never leave them on the client.
    response.cookies.delete(COOKIE.verifier);
    response.cookies.delete(COOKIE.state);
    response.cookies.delete(COOKIE.demo);

    return response;
  } catch {
    return NextResponse.redirect(`${origin}/?error=token_exchange_failed`);
  }
}
