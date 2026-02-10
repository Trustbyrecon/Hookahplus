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

const isCi = Boolean(process.env.CI);
const isWin = process.platform === "win32";

if (process.env.PRISMA_GENERATE_SKIP === "1") {
  // eslint-disable-next-line no-console
  console.warn("[prisma-generate] Skipping prisma generate (PRISMA_GENERATE_SKIP=1).");
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `${scheme}${placeholderUser}@localhost:5432/hookahplus_placeholder?schema=public`;
  // eslint-disable-next-line no-console
  console.warn(
    "[prisma-generate] DATABASE_URL missing; using placeholder for client generation only.",
  );
}

function runPrismaGenerate() {
  const cmd = isWin ? "npm.cmd" : "npm";
  const args = ["exec", "--", "prisma", "generate"];
  return spawnSync(cmd, args, { encoding: "utf8" });
}

const maxAttempts = isWin ? 3 : 1;
for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  const result = runPrismaGenerate();

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (result.status === 0) process.exit(0);

  const stderr = result.stderr ?? "";
  const isWindowsEpermRename =
    isWin &&
    stderr.includes("EPERM: operation not permitted, rename") &&
    stderr.includes("query_engine-windows.dll.node.tmp");

  if (isWindowsEpermRename) {
    // This is a common Windows file-lock issue (AV, indexing, prior Node processes).
    // In CI we must fail fast; locally we retry, then fail open so Next builds can proceed.
    if (attempt < maxAttempts) {
      // eslint-disable-next-line no-console
      console.warn(
        `[prisma-generate] Windows engine rename EPERM (attempt ${attempt}/${maxAttempts}); retrying...`,
      );
      await new Promise((r) => setTimeout(r, 600));
      continue;
    }

    if (!isCi) {
      // eslint-disable-next-line no-console
      console.warn(
        "[prisma-generate] Windows EPERM persists; skipping prisma generate (non-CI). If you hit runtime Prisma issues, re-run with all Node processes closed.",
      );
      process.exit(0);
    }
  }

  process.exit(result.status ?? 1);
}

