import 'server-only';
import { PrismaClient } from '@prisma/client';

// ---------------------------------------------------------------------------
// Prisma client singleton.
//
// In development, Next.js hot-reload can create many client instances and
// exhaust the database connection pool. Caching on globalThis prevents that.
//
// NOTE: The site runs fully on the seed dataset without a database. Prisma is
// used for the persistent features (community votes, submissions, admin) and
// is only instantiated when actually imported by a route that needs it.
// ---------------------------------------------------------------------------

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
