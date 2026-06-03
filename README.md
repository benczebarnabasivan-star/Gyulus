# Vadász Gyula — Rajongói Oldal 🤠

A modern, reszponzív rajongói weboldal a magyar TikTokos **Vadász Gyula**
([@vadasz_gyula](https://www.tiktok.com/@vadasz_gyula)) legviccesebb és
legújabb videóinak. Sötét, TikTok-ihlette dizájn, magyar nyelvű felület,
gyors betöltés és PWA-támogatás.

> **Nem hivatalos rajongói oldal.** Nem áll kapcsolatban a TikTokkal vagy a
> tartalom-készítővel. Minden videó és védjegy a jogtulajdonosokat illeti.

---

## ✨ Funkciók

- **Hero szekció** animált háttérrel, profillal és statisztikákkal
- **Legújabb videók** végtelen görgetéssel (`IntersectionObserver`)
- **Legviccesebb klipek** rendezéssel (közönségkedvenc / nézettség / kedvelés)
- **Felkapott** szekció (legnézettebb / legmegosztottabb / legkommentáltabb)
- **Keresés** feliratokban, kulcsszavakban és kategóriákban
- **Videó részletoldal** lite-embed lejátszóval, statisztikákkal, kapcsolódó
  videókkal és megosztással
- **Idézetek** megosztható kártyákon
- **Idővonal** a creator mérföldköveiről (animált)
- **Közösség**: szavazások, beküldési űrlap, rajongói fal
- **Admin felület**: beküldések moderálása, gyorsítótár frissítése
- **SEO**: dinamikus metaadatok, JSON-LD (VideoObject + ProfilePage),
  `sitemap.xml`, `robots.txt`, generált OG/Twitter képek
- **PWA**: telepíthető, offline támogatás (service worker)
- **Sötét/világos téma**, mobil-első reszponzív dizájn, `prefers-reduced-motion`
- **Teljesítmény**: kép-lazy-loading, kódoptimalizálás, gyorsítótárazás,
  loading skeletonok, hibakezelés

---

## 🧱 Tech stack

| Réteg        | Technológia                                    |
| ------------ | ---------------------------------------------- |
| Keretrendszer| Next.js 15 (App Router, RSC)                   |
| Nyelv        | TypeScript (strict)                            |
| Stílus       | Tailwind CSS 3                                 |
| Animáció     | Framer Motion                                  |
| Ikonok       | lucide-react                                   |
| Téma         | next-themes (osztály-alapú dark mode)          |
| Adatbázis    | PostgreSQL + Prisma (perzisztens funkciókhoz)  |
| Konténer     | Docker + docker-compose                        |

---

## 📁 Mappaszerkezet

```
Gyulus/
├── prisma/
│   ├── schema.prisma          # Prisma adatmodell (PostgreSQL)
│   └── seed.ts                # Adatbázis feltöltő script
├── db/
│   └── schema.sql             # Nyers SQL séma (Prisma alternatíva)
├── public/
│   ├── icon.svg               # PWA / favicon ikon
│   ├── icon-maskable.svg      # PWA maskable ikon
│   ├── avatar-placeholder.svg # Profilkép helyőrző
│   └── sw.js                  # Service worker (offline)
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Gyökér layout (téma, navbar, footer, JSON-LD)
│   │   ├── page.tsx           # Kezdőlap
│   │   ├── globals.css
│   │   ├── loading.tsx        # Route-szintű loading skeleton
│   │   ├── error.tsx          # Hibahatár
│   │   ├── not-found.tsx      # 404
│   │   ├── opengraph-image.tsx# Generált OG kép
│   │   ├── sitemap.ts         # Dinamikus sitemap
│   │   ├── robots.ts          # robots.txt
│   │   ├── manifest.ts        # PWA manifest
│   │   ├── icon.svg           # Favicon (app convention)
│   │   ├── latest/page.tsx    # /latest
│   │   ├── funny/page.tsx     # /funny
│   │   ├── trending/page.tsx  # /trending
│   │   ├── about/page.tsx     # /about
│   │   ├── community/page.tsx # /community
│   │   ├── admin/page.tsx     # /admin (moderáció)
│   │   ├── offline/page.tsx   # PWA offline fallback
│   │   ├── video/[id]/page.tsx# Videó részletoldal (SSG)
│   │   └── api/
│   │       ├── videos/route.ts       # Lista + szűrés + lapozás
│   │       ├── search/route.ts       # Keresés
│   │       ├── submissions/route.ts  # Közösségi beküldések (CRUD)
│   │       └── admin/
│   │           ├── login/route.ts    # Admin belépés
│   │           └── refresh/route.ts  # Gyorsítótár ürítése
│   ├── components/
│   │   ├── layout/            # Navbar, Footer
│   │   ├── providers/         # ThemeProvider, ServiceWorkerRegister
│   │   ├── home/              # Hero
│   │   ├── video/             # VideoCard, VideoGrid, InfiniteVideoFeed,
│   │   │                      #   VideoPlayer, SortTabs
│   │   ├── search/            # SearchBar
│   │   ├── quotes/            # QuoteCard
│   │   ├── timeline/          # Timeline
│   │   ├── community/         # PollCard, SubmissionForm
│   │   └── ui/                # Section, Badge, Skeleton, ShareButtons, ThemeToggle
│   ├── lib/
│   │   ├── data/              # Seed adatok (creator, videos, quotes, timeline)
│   │   ├── services/          # videoService, tiktok adapter, submissionStore
│   │   ├── db.ts              # Prisma singleton
│   │   ├── seo.ts             # Metaadat + JSON-LD helperek
│   │   └── utils.ts           # Formázók (szám, dátum, idő)
│   ├── config/
│   │   └── site.ts            # Branding, navigáció, SEO kulcsszavak
│   └── types/
│       └── index.ts           # Megosztott típusok
├── Dockerfile
├── docker-compose.yml
├── next.config.mjs
├── tailwind.config.ts
└── .env.example
```

---

## 🗄️ Adatbázis séma

PostgreSQL, a következő táblákkal (lásd `prisma/schema.prisma` és `db/schema.sql`):

- **`videos`** — videók metaadatai (caption, slug, thumbnail, feltöltés, kulcsszavak, flagek)
- **`categories`** + **`category_on_video`** — kategóriák (M:N)
- **`statistics`** — nézettség, kedvelés, komment, megosztás, `funny_score`
- **`featured_clips`** — kiemelt klipek sorrenddel
- **`community_votes`** — közösségi szavazatok (anonim fingerprint alapján)
- **`submissions`** — közösségi beküldések moderációs státusszal

---

## 🔌 API architektúra

Az alkalmazás egy **lecserélhető adatréteget** használ
(`src/lib/services/videoService.ts`), amely egységes felületet ad a UI-nak,
függetlenül attól, hogy az adat honnan jön:

```
UI / oldalak ──► videoService ──► [ seed adat | TikTok adapter | Prisma/DB ]
                      │
                      ├─ gyorsítótár (TTL alapú, in-memory)
                      └─ szűrés / keresés / rendezés / lapozás
```

**TikTok adapter** (`src/lib/services/tiktok.ts`) — három üzemmód a
`TIKTOK_DATA_SOURCE` env változóval:

| Érték      | Forrás                                                              |
| ---------- | ------------------------------------------------------------------ |
| `seed`     | Beépített, kurált mintaadat (alapértelmezett, hálózat nélkül)      |
| `official` | TikTok Display API (engedélyezett access token szükséges)          |
| `rapidapi` | Harmadik féltől származó TikTok scraper (RapidAPI)                  |

> ⚠️ **Megjegyzés a TikTok adatokról.** A TikTok hivatalos API-ja korlátozott
> (app-jóváhagyás + felhasználói hozzájárulás szükséges), és a direkt scraping
> a platform feltételeibe ütközhet. Ezért az oldal alapból egy **kurált
> mintaadat-készlettel** működik, így azonnal használható. A megjelenített
> statisztikák **illusztratívak**, amíg élő forrást nem konfigurálsz. Ha
> integrálsz egy forrást, **agresszív gyorsítótárazással** kerüld a túl gyakori
> lekéréseket (`TIKTOK_CACHE_TTL`), és tartsd be a platform feltételeit.

### REST végpontok

| Metódus | Útvonal                  | Leírás                                     |
| ------- | ------------------------ | ------------------------------------------ |
| GET     | `/api/videos`            | Lista (sort, funny, featured, q, category, cursor, limit) |
| GET     | `/api/search?q=`         | Keresés (caption / kulcsszó / kategória)   |
| GET/POST| `/api/submissions`       | Beküldések listája / létrehozása           |
| PATCH   | `/api/submissions`       | Moderáció (admin token szükséges)          |
| POST    | `/api/admin/login`       | Admin belépés (shared secret)              |
| POST    | `/api/admin/refresh`     | Videó-gyorsítótár ürítése (admin)          |

---

## 🚀 Helyi futtatás

```bash
# 1. Függőségek
npm install

# 2. Környezeti változók
cp .env.example .env        # alapból TIKTOK_DATA_SOURCE=seed

# 3. Fejlesztői szerver
npm run dev                 # http://localhost:3000
```

Adatbázis nélkül is teljesen működik (seed mód). A perzisztens funkciókhoz:

```bash
# PostgreSQL (pl. dockerrel)
docker compose up -d db

npm run prisma:generate
npm run prisma:migrate      # vagy: npx prisma db push
npm run db:seed             # mintaadatok betöltése
```

### Hasznos scriptek

| Script                  | Leírás                       |
| ----------------------- | ---------------------------- |
| `npm run dev`           | Fejlesztői szerver           |
| `npm run build`         | Produkciós build             |
| `npm run start`         | Produkciós szerver           |
| `npm run lint`          | ESLint                       |
| `npm run typecheck`     | TypeScript ellenőrzés        |
| `npm run db:seed`       | Adatbázis feltöltése         |

---

## 🐳 Docker

A teljes stack (app + PostgreSQL) egy paranccsal:

```bash
docker compose up --build
# App:      http://localhost:3000
# Postgres: localhost:5432  (gyulus / gyulus)
```

A `Dockerfile` többlépcsős build-et használ a kis image-méretért.

---

## 🌍 Telepítés (Vercel / önállóan)

**Vercel (ajánlott):**

1. Push a GitHub repóba, importáld a Vercelre.
2. Állítsd be a környezeti változókat (lásd `.env.example`).
3. Deploy — a `next build` automatikusan lefut.

**Önálló (Node/Docker):**

```bash
npm run build && npm run start   # vagy: docker compose up --build
```

Állítsd be a `NEXT_PUBLIC_SITE_URL`-t a valós domainre a helyes SEO/OG-hez.

---

## 🔐 Környezeti változók

Lásd `.env.example`. Legfontosabbak:

| Változó                | Leírás                                             |
| ---------------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Publikus URL (SEO, sitemap, OG)                    |
| `DATABASE_URL`         | PostgreSQL kapcsolat (Prisma)                      |
| `TIKTOK_DATA_SOURCE`   | `seed` \| `official` \| `rapidapi`                 |
| `TIKTOK_USERNAME`      | `vadasz_gyula`                                     |
| `TIKTOK_CACHE_TTL`     | Gyorsítótár élettartam (mp)                        |
| `ADMIN_PASSWORD`       | Admin felület jelszava                             |

---

## ⚡ Teljesítmény & SEO

- React Server Components + SSG a videóoldalakhoz (`generateStaticParams`)
- Kép-optimalizálás (`next/image`, AVIF/WebP), lazy loading
- Lite-embed videólejátszó (a nehéz TikTok script csak kattintásra töltődik)
- Gyorsítótárazás (Cache-Control + in-memory TTL)
- Dinamikus metaadatok, JSON-LD strukturált adat, sitemap, robots
- Cél kulcsszavak: _Vadász Gyula_, _Vadász Gyula TikTok_, _Vadász Gyula videók_,
  _Vicces magyar TikTok videók_, _Magyar TikTok sztárok_

---

## 📄 Licenc & jogi megjegyzés

Ez egy közösségi, nem kereskedelmi rajongói projekt oktatási céllal. A creator
neve, képmása és tartalmai a jogtulajdonost illetik. Élő adatforrás
integrálásakor mindig tartsd be a TikTok felhasználási feltételeit.
