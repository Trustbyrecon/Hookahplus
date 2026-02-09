import { PrismaClient } from "@prisma/client";
import { resolve } from "path";
import { testDatabaseConnection } from "./db-helpers";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

/**
 * IMPORTANT
 * - Do NOT instantiate PrismaClient at module import time.
 *   Next.js evaluates/loads route modules during build and Vercel previews may not have DATABASE_URL set,
 *   which would hard-fail deployments.
 * - Instead, lazily initialize on first access.
 */

function buildDatabaseUrlOrThrow(): string {
  // CRITICAL: Load .env.local lazily in dev/test (when present).
  // Next.js loads .env.local automatically, but our scripts / Playwright webServer may not.
  if (process.env.NODE_ENV !== "production") {
    try {
      const dotenv = require("dotenv");
      const envPath = resolve(process.cwd(), ".env.local");
      const result = dotenv.config({ path: envPath });
      if (result?.error) {
        console.warn("[db.ts] ⚠️ dotenv.config error:", result.error);
      }
    } catch {
      // ignore - dotenv is optional at runtime
    }
  }

  let databaseUrl = (process.env.DATABASE_URL || "").trim();

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Set DATABASE_URL to your database connection string (for example from Supabase/Vercel env).",
    );
  }

  // Local dev hardening (kept from prior version):
  // If DATABASE_URL is set to a bare sqlite path (e.g. \"./prisma/dev.db\"), Prisma will throw.
  // Auto-prefix with file: to keep dev scripts unblocked (does not apply when empty).
  if (process.env.NODE_ENV !== "production") {
    const hasProtocol = databaseUrl.includes("://") || databaseUrl.startsWith("file:");
    if (!hasProtocol) {
      databaseUrl = `file:${databaseUrl}`;
      process.env.DATABASE_URL = databaseUrl;
      console.warn("[db.ts] ⚠️ DATABASE_URL had no protocol; auto-prefixed with file: for local dev");
    }
  }

  // Add query_timeout to prevent long-running queries from hanging (only when URL is non-empty).
  if (!databaseUrl.includes("query_timeout")) {
    databaseUrl = databaseUrl.includes("?")
      ? `${databaseUrl}&query_timeout=5000`
      : `${databaseUrl}?query_timeout=5000`;
  }

  return databaseUrl;
}

function initPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const url = buildDatabaseUrlOrThrow();
  const prismaInstance = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: { db: { url } },
  });

  globalForPrisma.prisma = prismaInstance;

  // Non-blocking dev connection test (helps local debugging; harmless in CI).
  if (process.env.NODE_ENV !== "production") {
    testDatabaseConnection(prismaInstance, { maxRetries: 3 })
      .then((connected) => {
        if (connected) console.log("[db.ts] ✅ Database connection successful");
        else console.warn("[db.ts] ⚠️ Database connection failed after retries");
      })
      .catch(() => {
        // Silent fail - connection will be tested on first query
      });
  }

  return prismaInstance;
}

// Export a lazily-initialized PrismaClient via Proxy to avoid build-time crashes.
// NOTE: guard against "then" to avoid Promise/thenable assimilation in some runtimes.
const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, _receiver) {
    if (prop === "then") return undefined;
    const client = initPrisma();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export { prisma };