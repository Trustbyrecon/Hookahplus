import { PrismaClient } from "@prisma/client";
import { resolve } from "path";

// CRITICAL: Load .env.local BEFORE PrismaClient initialization
// Next.js loads .env.local automatically, but PrismaClient validates DATABASE_URL
// at instantiation time, which happens before Next.js env loading completes
if (process.env.NODE_ENV !== "production") {
  const dotenv = require('dotenv');
  const envPath = resolve(process.cwd(), '.env.local');
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    console.warn('[db.ts] ⚠️ dotenv.config error:', result.error);
  } else {
    console.log('[db.ts] 📁 Loaded .env.local from:', envPath);
    console.log('[db.ts] 🔑 DATABASE_URL:', process.env.DATABASE_URL 
      ? `SET (${process.env.DATABASE_URL.substring(0, 30)}...)` 
      : 'NOT SET');
  }
}

// Create PrismaClient instance with optimized connection pool settings
// The dotenv loading above ensures DATABASE_URL is available
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// P0: Optimize PrismaClient for high concurrency
// - Connection pool settings are controlled via DATABASE_URL (?connection_limit=30&pool_timeout=10)
// - Prisma automatically uses these settings from the connection string
// - Add query_timeout to prevent long-running queries from hanging
const databaseUrl = process.env.DATABASE_URL || '';
const hasQueryTimeout = databaseUrl.includes('query_timeout');
const finalDatabaseUrl = hasQueryTimeout 
  ? databaseUrl 
  : databaseUrl.includes('?')
    ? `${databaseUrl}&query_timeout=5000`
    : `${databaseUrl}?query_timeout=5000`;

const prismaInstance = globalForPrisma.prisma ?? new PrismaClient({ 
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  datasources: {
    db: {
      url: finalDatabaseUrl,
    },
  },
});

// P0: PrismaClient automatically uses connection pool settings from DATABASE_URL
// Connection pooling is handled by Prisma internally via the connection string parameters:
// - connection_limit=30: Max 30 concurrent connections
// - pool_timeout=10: 10 second timeout for acquiring a connection
// No additional retry wrapper needed - Prisma handles connection management internally
const prisma = prismaInstance;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaInstance;
}

export { prisma };