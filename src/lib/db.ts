import { PrismaClient } from "@prisma/client";
// v4-cache-break-tz-rename: 2026-04-09

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma_v3: PrismaClient };

export const prisma =
  globalForPrisma.prisma_v3 || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma_v3 = prisma;
