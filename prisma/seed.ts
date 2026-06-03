/**
 * Database seed script.
 * Usage: `npm run db:seed` (requires DATABASE_URL + `prisma migrate`/`db push`).
 *
 * Loads the curated seed dataset into PostgreSQL so the persistent features
 * (community votes, featured ordering, admin) have real rows to work with.
 */
import { PrismaClient } from '@prisma/client';
import { seedVideos } from '../src/lib/data/videos';

const prisma = new PrismaClient();

function funnyScore(v: (typeof seedVideos)[number]): number {
  const engagement =
    v.stats.likes + v.stats.shares * 2 + v.stats.comments * 1.5;
  return (engagement / Math.max(v.stats.views, 1)) * 1000 + (v.funny ? 250 : 0);
}

async function main() {
  console.log('🌱 Seeding database…');

  // Distinct categories from the dataset.
  const categoryNames = Array.from(
    new Set(seedVideos.flatMap((v) => v.categories)),
  );

  const categoryBySlug = new Map<string, string>();
  for (const name of categoryNames) {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const cat = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    categoryBySlug.set(name, cat.id);
  }

  let position = 0;
  for (const v of seedVideos) {
    const video = await prisma.video.upsert({
      where: { tiktokId: v.tiktokId },
      update: {},
      create: {
        tiktokId: v.tiktokId,
        caption: v.caption,
        slug: v.slug,
        thumbnailUrl: v.thumbnailUrl,
        videoUrl: v.url,
        durationSec: v.durationSec,
        uploadedAt: new Date(v.uploadedAt),
        keywords: v.keywords,
        featured: v.featured,
        funny: v.funny,
        stats: {
          create: {
            views: v.stats.views,
            likes: v.stats.likes,
            comments: v.stats.comments,
            shares: v.stats.shares,
            funnyScore: funnyScore(v),
          },
        },
        categories: {
          create: v.categories.map((name) => ({
            category: { connect: { id: categoryBySlug.get(name)! } },
          })),
        },
      },
    });

    if (v.featured) {
      await prisma.featuredClip.upsert({
        where: { videoId: video.id },
        update: { position },
        create: { videoId: video.id, position, reason: 'Seed featured' },
      });
      position += 1;
    }
  }

  console.log(
    `✅ Done: ${seedVideos.length} videos, ${categoryNames.length} categories.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
