# Resonance

Connect Spotify, see what you actually listen to, and find the festivals your artists are
playing — down to the day, the stage and the set time.

- **Your listening** — top artists, top tracks, what's playing right now, recent plays.
- **Ranked festivals** — every lineup scored against your real listening history.
- **Set times** — a clashfinder-style timetable with your artists lit up, and a warning when
  two of them are on at once.

Built with Next.js 15 (App Router), TypeScript and Tailwind.

---

## Quick start

```bash
npm install
npm run dev
```

Open <http://127.0.0.1:3000>. Without Spotify credentials the app still runs — click
**Try the demo** to explore the whole product against a built-in sample listener.

## Connecting a real Spotify account

1. Create an app at the [Spotify developer dashboard](https://developer.spotify.com/dashboard).
2. Add `http://127.0.0.1:3000/api/auth/callback` as a Redirect URI on that app.
3. Copy the example env file and fill in the client ID:

```bash
cp .env.example .env.local
```

```dotenv
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/auth/callback
NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000
```

`SPOTIFY_CLIENT_SECRET` is optional — the app uses Authorization Code with PKCE, which does
not need one. Set it only if your Spotify app is configured as confidential.

> Spotify no longer accepts `localhost` in redirect URIs; use `127.0.0.1` in development.

### Scopes requested

`user-read-email`, `user-top-read`, `user-read-currently-playing`, `user-read-recently-played` —
all read-only. Nothing is written back to your account.

### Where tokens live

Access and refresh tokens are kept in `httpOnly`, `SameSite=Lax` cookies scoped to your own
session, and are `Secure` in production. There is no database and no server-side user store;
signing out clears the cookies.

## How the matching works

`src/lib/festivals/match.ts` scores each festival out of 100:

| Component | Weight | What it measures |
| --- | --- | --- |
| Artist coverage | 72% | Share of your total listening weight that appears on the bill. Each of your top artists carries an exponentially decaying rank weight (`#1` counts far more than `#40`), multiplied by how high they are billed. |
| Genre affinity | 28% | How much of your rank-weighted genre profile the festival's genre tags cover, matched loosely so `belgian techno` still hits `techno`. |

Coverage is expressed as a **ratio of what you could possibly match**, not as an unbounded
sum — so a lineup carrying your top 3 scores well below one carrying your top 20, instead of
both pinning at the ceiling.

Overlaps are detected pairwise per day. Times before 06:00 are treated as belonging to the
previous night, so a 23:30–01:00 set is one continuous block rather than one that wraps around
to the start of the day.

## Project layout

```
src/
  app/
    page.tsx                  Landing
    dashboard/                Your listening + ranked matches
    festivals/                Calendar
    festivals/[slug]/         Lineup poster, day picker, timetable
    api/auth/                 login · callback · logout · demo
  components/
    festival/                 FestivalCard, Timetable, LineupPoster
    dashboard/                NowPlaying, TopArtistsRail, UpcomingSets
    visual/                   Aurora, FestivalArt, ScoreRing, Equalizer, …
  lib/
    spotify/                  OAuth (PKCE), API client, session, demo listener
    festivals/                Data, types, matching engine
```

## A note on the data

Festival **names, cities and seasons are real**. The day-by-day **lineups and set times are
sample data** written for this demo — they are not announced schedules, and the UI labels them
as such throughout. Check the official festival site before making any plans.

To run on real listings, replace the body of `getFestivals()` in `src/lib/festivals/index.ts`
with a call to a provider (Ticketmaster Discovery, Songkick, Bandsintown) that returns the same
`Festival[]` shape. Everything downstream — scoring, timetable, clash detection — keeps working
unchanged.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier |

---

Not affiliated with Spotify AB or any festival organiser.
