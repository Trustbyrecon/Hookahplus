import { PrismaClient } from "@prisma/client";

const g = globalThis as any;
export const prisma: PrismaClient =
  g.__PRISMA__ ?? (g.__PRISMA__ = new PrismaClient());
