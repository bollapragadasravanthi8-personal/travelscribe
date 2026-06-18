import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function createPrismaClient() {
  const connectionString = env.databaseUrl;

  if (!connectionString) {
    // Return an unconfigured client for scaffold builds without a database.
    // Real queries will fail until DATABASE_URL is set.
    return new PrismaClient({
      adapter: new PrismaPg(new Pool({ connectionString: "postgresql://" })),
    });
  }

  const pool =
    globalForPrisma.pgPool ??
    new Pool({
      connectionString,
      // One connection per serverless instance avoids pool exhaustion on Vercel.
      max: process.env.VERCEL ? 1 : 10,
      idleTimeoutMillis: 20_000,
    });
  globalForPrisma.pgPool = pool;

  return new PrismaClient({
    adapter: new PrismaPg(pool),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;
