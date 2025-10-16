import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:C:\\Users\\Dwayne Clark\\Projects\\Hookahplus\\dev.db";
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
