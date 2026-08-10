import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const SCOPES = [
  'user-read-email',
  'user-top-read',
  'user-read-currently-playing',
  'user-read-recently-played',
].join(' ');

export const COOKIE = {
  accessToken: 'rz_at',
  refreshToken: 'rz_rt',
  expiresAt: 'rz_exp',
  verifier: 'rz_pkce',
  state: 'rz_state',
  demo: 'rz_demo',
} as const;

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const AUTHORIZE_ENDPOINT = 'https://accounts.spotify.com/authorize';

export function spotifyConfig() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || undefined;
  const redirectUri =
    process.env.SPOTIFY_REDIRECT_URI ??
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://127.0.0.1:3000'}/api/auth/callback`;
  return { clientId, clientSecret, redirectUri };
}

/** True when the deployment has enough config to run a real OAuth flow. */
export function isSpotifyConfigured(): boolean {
  return Boolean(spotifyConfig().clientId);
}

function base64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function createVerifier(): string {
  return base64url(randomBytes(64));
}

export function challengeFor(verifier: string): string {
  return base64url(createHash('sha256').update(verifier).digest());
}

export function createState(): string {
  return base64url(randomBytes(16));
}

/** Constant-time compare so a returned `state` cannot be probed byte by byte. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function buildAuthorizeUrl(challenge: string, state: string): string {
  const { clientId, redirectUri } = spotifyConfig();
  const params = new URLSearchParams({
    client_id: clientId ?? '',
    response_type: 'code',
    redirect_uri: redirectUri,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state,
    scope: SCOPES,
    show_dialog: 'false',
  });
  return `${AUTHORIZE_ENDPOINT}?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
};

async function requestToken(body: URLSearchParams): Promise<TokenResponse> {
  const { clientId, clientSecret } = spotifyConfig();
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  // Confidential apps authenticate with Basic; PKCE-only apps send client_id in the body.
  if (clientSecret) {
    headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
  } else {
    body.set('client_id', clientId ?? '');
  }

  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers,
    body,
    cache: 'no-store',
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Spotify token request failed (${res.status}): ${detail}`);
  }
  return (await res.json()) as TokenResponse;
}

export function exchangeCode(code: string, verifier: string): Promise<TokenResponse> {
  const { redirectUri } = spotifyConfig();
  return requestToken(
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    }),
  );
}

export function refreshToken(token: string): Promise<TokenResponse> {
  return requestToken(
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: token,
    }),
  );
}

const secure = process.env.NODE_ENV === 'production';

export async function persistSession(tokens: TokenResponse): Promise<void> {
  const jar = await cookies();
  const maxAge = 60 * 60 * 24 * 30;

  jar.set(COOKIE.accessToken, tokens.access_token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
  jar.set(COOKIE.expiresAt, String(Date.now() + tokens.expires_in * 1000), {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
  if (tokens.refresh_token) {
    jar.set(COOKIE.refreshToken, tokens.refresh_token, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge,
    });
  }
  // A real session supersedes demo mode.
  jar.delete(COOKIE.demo);
}

/**
 * Returns a usable access token, refreshing it when it is within 60s of expiry.
 * Returns null when there is no session (or the refresh has been revoked).
 *
 * Note: refreshed tokens can only be written back to the cookie jar from a
 * Route Handler or Server Action — during a Server Component render Next.js
 * makes the jar read-only, so we fall back to using the fresh token in-memory
 * for that request only.
 */
export async function getAccessToken(): Promise<string | null> {
  const jar = await cookies();
  const access = jar.get(COOKIE.accessToken)?.value;
  const expiresAt = Number(jar.get(COOKIE.expiresAt)?.value ?? 0);
  const refresh = jar.get(COOKIE.refreshToken)?.value;

  if (access && Date.now() < expiresAt - 60_000) return access;
  if (!refresh) return access ?? null;

  try {
    const tokens = await refreshToken(refresh);
    try {
      await persistSession(tokens);
    } catch {
      // Read-only cookie jar during render — token still valid for this request.
    }
    return tokens.access_token;
  } catch {
    return null;
  }
}

export async function isDemoSession(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(COOKIE.demo)?.value === '1';
}
