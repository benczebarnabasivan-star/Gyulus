# Vadász Gyula — Rajongói Oldal 🤠

Modern, reszponzív **rajongói weboldal** a magyar TikTokos **Vadász Gyula**
([@vadasz_gyula](https://www.tiktok.com/@vadasz_gyula)) videóinak. Sötét,
TikTok-ihlette dizájn, magyar nyelvű felület, PWA-támogatás.

> **Nem hivatalos rajongói oldal.** Nem áll kapcsolatban a TikTokkal vagy a
> tartalom-készítővel. Minden videó és védjegy a jogtulajdonosokat illeti.

## 🎬 Hogyan jelenik meg a tartalom (fontos!)

A site **kizárólag valódi TikTok tartalmat** mutat, a **TikTok hivatalos
beágyazásain** keresztül — API-kulcs és scraping nélkül, a platform
feltételeit tiszteletben tartva:

- **Élő feed** (`/latest`) — a TikTok hivatalos **creator embed** widgetje
  (`embed.js`) rendereli Vadász Gyula legfrissebb videóit, élőben.
- **Kiemelt / válogatott klipek** — a [TikTok oEmbed](https://developers.tiktok.com/doc/embed-videos)
  hivatalos, publikus végpontjáról kapott **valódi** felirat + bélyegkép +
  lejátszó. A megjelenő videókat a `src/lib/data/realVideos.ts` lista vezérli.
- **Nincsenek kitalált statisztikák.** Megtekintés/kedvelés számokat és
  feltöltési dátumokat NEM jelenítünk meg, mert ezek harmadik fél
  alkotójához az ő engedélye nélkül nem szerezhetők meg — és nem találunk ki
  ilyet. A számok a TikTokon érhetők el.
- Az **idézetek** és az **idővonal** egyértelműen jelölt **rajongói**
  tartalom (illusztratív).

### Új videó hozzáadása
Vedd fel a videó TikTok azonosítóját a `src/lib/data/realVideos.ts` fájlba.
Csak a hiteles `@vadasz_gyula` fiók videóit add hozzá. A rendszer
automatikusan ellenőrzi oEmbeddel; a privát/törölt videók kimaradnak.

## ✨ Funkciók

- Animált **hero** szekció és profil
- **Élő TikTok feed** (hivatalos creator embed)
- **Válogatott klipek** valódi videókból (hivatalos lejátszó, lite-embed)
- **Videó részletoldal** valódi felirattal, beágyazott lejátszóval, megosztással
- **Idézetek** és animált **idővonal** (rajongói tartalom)
- **Közösség**: szavazások, beküldési űrlap, rajongói fal
- **Admin** moderációs felület (shared-secret belépés)
- **SEO**: dinamikus metaadatok, JSON-LD, `sitemap.xml`, `robots.txt`,
  generált OG/Twitter képek
- **PWA**: manifest + service worker + offline oldal
- Sötét/világos téma, mobil-első dizájn, loading skeletonok, hibahatárok

## 🧱 Tech stack

Next.js 15 (App Router/RSC) · TypeScript (strict) · Tailwind CSS ·
Framer Motion · next-themes · lucide-react · (opcionális) Prisma + PostgreSQL
a közösségi/admin funkciókhoz · Docker.

## 📁 Mappaszerkezet (lényeg)

```
src/
├── app/
│   ├── page.tsx            # Kezdőlap
│   ├── latest/             # Élő TikTok feed (creator embed)
│   ├── funny/              # Válogatott valódi klipek
│   ├── video/[id]/         # Videó részletoldal (valódi embed)
│   ├── about/ community/ admin/ offline/
│   ├── api/
│   │   ├── submissions/    # Közösségi beküldések (CRUD)
│   │   └── admin/          # login + cache refresh
│   ├── sitemap.ts robots.ts manifest.ts opengraph-image.tsx
│   └── layout.tsx globals.css
├── components/
│   ├── video/  TikTokCreatorEmbed · TikTokVideoEmbed · RealVideoCard
│   ├── home/ quotes/ timeline/ community/ layout/ providers/ ui/
├── lib/
│   ├── data/      creator · realVideos · quotes · timeline
│   ├── services/  videoService · oembed
│   └── seo.ts utils.ts
├── config/site.ts
└── types/index.ts
```

## 🚀 Helyi futtatás

```bash
npm install
cp .env.example .env       # nincs szükség TikTok kulcsra
npm run dev                # http://localhost:3000
```

A site adatbázis és kulcs nélkül is teljesen működik.

| Script              | Leírás                |
| ------------------- | --------------------- |
| `npm run dev`       | Fejlesztői szerver    |
| `npm run build`     | Produkciós build      |
| `npm run start`     | Produkciós szerver    |
| `npm run lint`      | ESLint                |
| `npm run typecheck` | TypeScript ellenőrzés |

## 🐳 Docker

```bash
docker compose up --build   # app + (opcionális) PostgreSQL
```

## 🌍 Telepítés (Vercel)

1. Push a GitHub repóba, importáld a [Vercel](https://vercel.com)-re.
2. Állítsd be a `NEXT_PUBLIC_SITE_URL`-t a valós domainre.
3. Deploy — a `next build` automatikusan lefut.

## 🔐 Környezeti változók

Lásd `.env.example`:

| Változó                | Leírás                                  |
| ---------------------- | --------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Publikus URL (SEO, sitemap, OG)         |
| `TIKTOK_USERNAME`      | `vadasz_gyula`                          |
| `TIKTOK_CACHE_TTL`     | oEmbed gyorsítótár (mp)                 |
| `DATABASE_URL`         | (opcionális) PostgreSQL a közösséghez   |
| `ADMIN_PASSWORD`       | Admin felület jelszava                  |

## 📄 Jogi megjegyzés

Közösségi, nem kereskedelmi rajongói projekt. A creator neve, képmása és
tartalmai a jogtulajdonost illetik. A videók a TikTok hivatalos
beágyazásain keresztül, az eredeti forrásból jelennek meg.
