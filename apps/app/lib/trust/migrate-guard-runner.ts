/**
 * Server-only: runs Prisma CLI via `node …/prisma/build/index.js` only.
 * Never uses `npx` — Vercel serverless sandboxes break npm (ENOENT under /home/sbx_*).
 */

import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export interface MigrateGuardRunInput {
  label: string;
  command?: 'db_push' | 'migrate_deploy';
  /** App root (where package.json + prisma/schema.prisma live). Defaults to process.cwd(). */
  cwd?: string;
}

export interface MigrateGuardRunResult {
  ok: boolean;
  label: string;
  command: 'db_push' | 'migrate_deploy';
  startedAt: string;
  finishedAt: string;
  stdout: string;
  stderr: string;
  auditLine: string;
}

function resolveArgs(command: 'db_push' | 'migrate_deploy'): string[] {
  return command === 'migrate_deploy' ? ['migrate', 'deploy'] : ['db', 'push'];
}

/**
 * Resolve prisma CLI entry the same way Node would from the app package (works when
 * node_modules is hoisted or paths differ from cwd/node_modules/prisma/...).
 */
function resolvePrismaCliPath(cwd: string): string | null {
  const pkgJson = join(cwd, 'package.json');
  if (!existsSync(pkgJson)) {
    return null;
  }
  try {
    const requireFromApp = createRequire(pkgJson);
    const prismaPkgFile = requireFromApp.resolve('prisma/package.json');
    const cli = join(dirname(prismaPkgFile), 'build', 'index.js');
    if (existsSync(cli)) {
      return cli;
    }
  } catch {
    // prisma not resolvable from this package.json
  }

  const legacy = join(cwd, 'node_modules', 'prisma', 'build', 'index.js');
  return existsSync(legacy) ? legacy : null;
}

export async function runMigrateGuardedPrisma(
  input: MigrateGuardRunInput
): Promise<MigrateGuardRunResult> {
  const startedAt = new Date().toISOString();
  const cmdKind = input.command ?? 'db_push';
  const cwd = input.cwd ?? process.cwd();
  const args = resolveArgs(cmdKind);
  const env = {
    ...process.env,
    CI: 'true',
    // Avoid tooling writing under a missing sandbox home (some npm-adjacent code paths)
    HOME: process.env.HOME || process.env.TMPDIR || '/tmp',
  };

  const cliJs = resolvePrismaCliPath(cwd);
  if (!cliJs) {
    const finishedAt = new Date().toISOString();
    return {
      ok: false,
      label: input.label,
      command: cmdKind,
      startedAt,
      finishedAt,
      stdout: '',
      stderr: [
        `Could not resolve Prisma CLI from ${cwd} (no prisma package or build/index.js).`,
        'This deploy may omit devDependencies; use CI `prisma migrate deploy` for production DB instead.',
      ].join('\n'),
      auditLine: `[MigrateGuard] ${input.label} failed via ${cmdKind}`,
    };
  }

  try {
    const result = await execFileAsync(process.execPath, [cliJs, ...args], {
      cwd,
      env,
      maxBuffer: 10 * 1024 * 1024,
    });

    const finishedAt = new Date().toISOString();
    const stdout = result.stdout ?? '';
    const stderr = result.stderr ?? '';

    return {
      ok: true,
      label: input.label,
      command: cmdKind,
      startedAt,
      finishedAt,
      stdout,
      stderr,
      auditLine: `[MigrateGuard] ${input.label} succeeded via ${cmdKind}`,
    };
  } catch (error: unknown) {
    const finishedAt = new Date().toISOString();
    const err = error as {
      stdout?: string;
      stderr?: string;
      message?: string;
      code?: string | number;
    };

    const detail =
      [err.stderr, err.stdout, err.message, err.code != null ? `exit/code: ${err.code}` : '']
        .filter(Boolean)
        .join('\n') || 'Unknown migrate failure';

    return {
      ok: false,
      label: input.label,
      command: cmdKind,
      startedAt,
      finishedAt,
      stdout: err.stdout ?? '',
      stderr: detail,
      auditLine: `[MigrateGuard] ${input.label} failed via ${cmdKind}`,
    };
  }
}
