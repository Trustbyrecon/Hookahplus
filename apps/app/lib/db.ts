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

// Create PrismaClient instance
// The dotenv loading above ensures DATABASE_URL is available
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ["error"] });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}