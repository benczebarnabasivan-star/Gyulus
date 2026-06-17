import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/login — minimal shared-secret check for the demo admin area.
 * Returns the token (the password itself) on success; the client stores it and
 * sends it as a Bearer token on privileged requests.
 *
 * For a real deployment, replace with proper auth (e.g. NextAuth, OAuth, or a
 * provider-managed session) and never return the secret to the client.
 */
export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: 'Az admin felület nincs beállítva (ADMIN_PASSWORD hiányzik).' },
      { status: 503 },
    );
  }
  try {
    const { password } = await req.json();
    if (password === expected) {
      return NextResponse.json({ ok: true, token: expected });
    }
  } catch {
    /* fall through */
  }
  return NextResponse.json({ error: 'Hibás jelszó.' }, { status: 401 });
}
