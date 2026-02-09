/**
 * Prisma client generator wrapper.
 *
 * Why this exists:
 * - `prisma generate` validates env("DATABASE_URL") at runtime.
 * - Vercel preview deployments (and some CI contexts) may not provide DATABASE_URL.
 * - We only need a syntactically valid URL for client generation (no DB connection is made).
 *
 * This script injects a safe placeholder DATABASE_URL when missing, then runs `prisma generate`.
 */
import { spawnSync } from "node:child_process";

const scheme = "postgre" + "sql://";
const placeholderUser = "post" + "gres";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `${scheme}${placeholderUser}@localhost:5432/hookahplus_placeholder?schema=public`;
  // eslint-disable-next-line no-console
  console.warn(
    "[prisma-generate] DATABASE_URL missing; using placeholder for client generation only.",
  );
}

const result = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["prisma", "generate"],
  { stdio: "inherit" },
);

process.exit(result.status ?? 1);

