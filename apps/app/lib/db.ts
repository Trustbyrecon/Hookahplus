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

// Only create PrismaClient if DATABASE_URL is available
// This prevents Prisma from throwing validation errors
let prismaInstance: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set. ' +
      'Please ensure .env.local exists in apps/app directory with DATABASE_URL=postgresql://...'
    );
  }
  
  if (!prismaInstance) {
    const globalForPrisma = global as unknown as { prisma?: PrismaClient };
    prismaInstance = globalForPrisma.prisma ?? new PrismaClient({ log: ["error"] });
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prismaInstance;
    }
  }
  
  return prismaInstance;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return getPrismaClient()[prop as keyof PrismaClient];
  }
});