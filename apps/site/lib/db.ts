import { PrismaClient } from "@prisma/client";
import { resolve } from "path";

// CRITICAL: Load .env.local BEFORE PrismaClient initialization
// Next.js loads .env.local automatically, but PrismaClient validates DATABASE_URL
// at instantiation time, which happens before Next.js env loading completes
if (process.env.NODE_ENV !== "production") {
  try {
    const dotenv = require('dotenv');
    // Try site build .env.local first, then root .env.local
    const siteEnvPath = resolve(process.cwd(), '.env.local');
    const rootEnvPath = resolve(process.cwd(), '../../.env.local');
    
    let result = dotenv.config({ path: siteEnvPath });
    if (result.error) {
      // Fallback to root .env.local
      result = dotenv.config({ path: rootEnvPath });
    }
    
    if (result.error) {
      console.warn('[db.ts] ⚠️ dotenv.config error:', result.error);
    } else {
      console.log('[db.ts] 📁 Loaded .env.local');
      console.log('[db.ts] 🔑 DATABASE_URL:', process.env.DATABASE_URL 
        ? `SET (${process.env.DATABASE_URL.substring(0, 30)}...)` 
        : 'NOT SET');
    }
  } catch (error) {
    console.warn('[db.ts] ⚠️ Failed to load dotenv:', error);
  }
}

// Create PrismaClient instance with optimized connection pool settings
// Point to root Prisma schema (monorepo setup)
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const prismaInstance = globalForPrisma.prisma ?? new PrismaClient({ 
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

const prisma = prismaInstance;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaInstance;
}

export { prisma };

