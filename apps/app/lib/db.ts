import { PrismaClient } from "@prisma/client";
import { resolve } from "path";

// Load .env.local in development if DATABASE_URL is not set
// This ensures DATABASE_URL is available when PrismaClient is instantiated
if (process.env.NODE_ENV !== "production" && !process.env.DATABASE_URL) {
  try {
    // Use dynamic require to avoid ES module issues
    const dotenv = require('dotenv');
    const envPath = resolve(process.cwd(), '.env.local');
    const result = dotenv.config({ path: envPath });
    if (!result.error && process.env.DATABASE_URL) {
      console.log('[db.ts] ✅ Loaded DATABASE_URL from .env.local');
    }
  } catch (e) {
    // dotenv not available, rely on Next.js env loading
    console.warn('[db.ts] ⚠️ Could not load .env.local:', e);
  }
}

const globalForPrisma = global as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ["error"] });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;