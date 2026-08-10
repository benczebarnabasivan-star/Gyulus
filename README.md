# Resonance

Connect Spotify, see what you actually listen to, and find the Hungarian festivals and concerts
your artists are playing.

- **Your listening** — top artists, top tracks, what's playing right now, recent plays,
  switchable across the last 4 weeks / 6 months / all time.
- **Hungarian gigs** — Sziget, STRAND Fesztivál, Budapest Park and PLÁZS Siófok, each bill
  scored against your real listening history.
- **Dates you can act on** — which day each of your artists plays, exportable to your calendar.

Built with Next.js 15 (App Router), TypeScript and Tailwind.

---

## Where the event data comes from

**This matters more than any feature in this app, so it is stated first.**

Every listing carries a `SourceRef` — a named origin, a link, the date it was read, and a
`verified` flag — and the UI renders it on the event card and the event page. You can always
tell where a line of data came from.

There are two modes:

| Mode | When | What you get |
| --- | --- | --- |
| **Snapshot** (default) | No `SONGKICK_API_KEY` | A verified static snapshot recorded on 10 Aug 2026 from each event's published source (Time Out Hungary, Sonline, Songkick, HelloBalaton). Real events, real dates. Goes stale over time. |
| **Live** | `SONGKICK_API_KEY` set | Listings pulled from the Songkick API and matched to your Spotify top artists, alongside the curated Hungarian anchors. |

Two rules the dataset enforces, in `src/lib/events/data/hungary.ts`:

1. **No artist appears on a bill unless a source listed them.**
2. **No start time is written unless a running order was actually published.**

Hungarian festivals release full stage-by-stage timetables close to the event, so most acts
currently have a **date but no time**. The app says so explicitly rather than filling the gap —
and the calendar export writes those as **all-day entries** instead of inventing an hour.

### Why Songkick

It is the only provider with real coverage of these venues. Ticketmaster's Discovery API does
not serve Hungary, and Bandsintown's API rejects requests without an approved partner id.
Request a key at <https://www.songkick.com/developer>.

## Quick start

```bash
npm install
npm run dev
```

Open <http://127.0.0.1:3000>. Without Spotify credentials the app still runs — click
**Try the demo** to explore against a built-in sample listener (clearly labelled as such).

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
not need one.

> Spotify no longer accepts `localhost` in redirect URIs; use `127.0.0.1` in development.

### Scopes requested

`user-read-email`, `user-top-read`, `user-read-currently-playing`, `user-read-recently-played` —
all read-only. Nothing is written back to your account.

### Where tokens live

Access and refresh tokens are kept in `httpOnly`, `SameSite=Lax` cookies scoped to your own
session, and are `Secure` in production. There is no database and no server-side user store;
signing out clears the cookies.

## How the matching works

`src/lib/events/match.ts` scores each event out of 100:

| Component | Weight | What it measures |
| --- | --- | --- |
| Artist coverage | 72% | Share of your total listening weight that is on the bill. Each top artist carries an exponentially decaying rank weight, so `#1` counts far more than `#40`. |
| Genre affinity | 28% | How much of your rank-weighted genre profile the event's tags cover, matched loosely so `belgian techno` still hits `techno`. |

Coverage is a **ratio of what you could possibly match**, not an unbounded sum, so scores stay
discriminating instead of all pinning near the ceiling.

## Calendar export

`GET /api/events/[slug]/calendar` returns your own acts at an event as an RFC 5545 `.ics` file;
add `?day=YYYY-MM-DD` to scope it to one day. Requires a session (401 otherwise), and returns
404 when none of your artists have a *dated* appearance — an act announced without a day cannot
be put in a calendar.

Entries with a published set time are written as timed events (with after-midnight sets rolling
`DTEND` onto the next date); entries without one are written as all-day events. Content lines
are folded at 75 octets over UTF-8 byte boundaries, so names like `Dzsúdló` and
`Kispál és a Borz` cannot split mid-codepoint.

## Branding

Site name and creator credit live in [`src/config/site.ts`](src/config/site.ts). Change them
there and the navbar, footer, page metadata and calendar exports all follow.

## Project layout

```
src/
  app/
    page.tsx                  Landing
    dashboard/                Your listening + ranked gigs
    events/                   Hungarian calendar
    events/[slug]/            Bill, day by day, with provenance
    api/auth/                 login · callback · logout · demo
    api/events/[slug]/        calendar (.ics)
  components/
    event/                    EventCard, SourceNote
    dashboard/                NowPlaying, TopArtistsRail, UpcomingSets, RangeSwitcher
    visual/                   Aurora, FestivalArt, ScoreRing, Equalizer, …
  lib/
    spotify/                  OAuth (PKCE), API client, session, demo listener
    events/                   Types, verified data, Songkick provider, matching, ics
```

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

Not affiliated with Spotify AB, Songkick, or any festival organiser or venue. Always confirm
dates on the official site before travelling.
