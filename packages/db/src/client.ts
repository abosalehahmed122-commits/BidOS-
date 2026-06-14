import { PrismaClient } from '@prisma/client';

/**
 * Base ("system") Prisma client — a lazily-instantiated singleton.
 * Use this only for non-tenant work (auth, plans, creating workspaces/users).
 * For tenant data always go through `forWorkspace(workspaceId)`.
 */
const globalForPrisma = globalThis as unknown as { __bidOsPrisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.__bidOsPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__bidOsPrisma = prisma;
}
