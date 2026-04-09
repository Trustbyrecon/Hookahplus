/**
 * Server-only: runs Prisma CLI via `node …/prisma/build/index.js` only.
 * Never uses `npx` — Vercel serverless sandboxes break npm (ENOENT under /home/sbx_*).
 */

import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/** Where package.json + prisma/schema.prisma live (Vercel cwd may be repo root or apps/app). */
function resolveAppRoot(explicit?: string): string {
  if (explicit) {
    return explicit;
  }
  const fromEnv = process.env.MIGRATE_GUARD_APP_ROOT?.trim();
  if (
    fromEnv &&
    existsSync(join(fromEnv, 'package.json')) &&
    existsSync(join(fromEnv, 'prisma', 'schema.prisma'))
  ) {
    return fromEnv;
  }
  const candidates = [process.cwd(), join(process.cwd(), 'apps', 'app')];
  for (const c of candidates) {
    if (
      existsSync(join(c, 'package.json')) &&
      existsSync(join(c, 'prisma', 'schema.prisma'))
    ) {
      return c;
    }
  }
  return process.cwd();
}

export interface MigrateGuardRunInput {
  label: string;
  command?: 'db_push' | 'migrate_deploy';
  /** App root (where package.json + prisma/schema.prisma live). Defaults to resolved app root. */
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

function withCliBanner(cwd: string, cliJs: string, chunk: string): string {
  const banner = [
    `[MigrateGuard] prisma CLI: ${cliJs}`,
    `[MigrateGuard] cwd: ${cwd}`,
    `[MigrateGuard] runner: node execFile (no npx)`,
    '---',
  ].join('\n');
  return chunk ? `${banner}\n${chunk}` : banner;
}

export async function runMigrateGuardedPrisma(
  input: MigrateGuardRunInput
): Promise<MigrateGuardRunResult> {
  const startedAt = new Date().toISOString();
  const cmdKind = input.command ?? 'db_push';
  const cwd = resolveAppRoot(input.cwd);
  const args = resolveArgs(cmdKind);
  const tmpHome = process.env.TMPDIR || tmpdir();
  const env = {
    ...process.env,
    CI: 'true',
    // Vercel serverless: default HOME may point at a missing path; npm/npx break with ENOENT.
    HOME: process.env.VERCEL ? tmpHome : process.env.HOME || tmpHome,
    NPM_CONFIG_CACHE: process.env.NPM_CONFIG_CACHE || join(tmpHome, '.npm-cache'),
    npm_config_cache: process.env.npm_config_cache || join(tmpHome, '.npm-cache'),
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
      stderr: withCliBanner(
        cwd,
        '(unresolved)',
        [
          `Could not resolve Prisma CLI from ${cwd} (no prisma package or build/index.js).`,
          'This deploy may omit devDependencies; use CI `prisma migrate deploy` for production DB instead.',
        ].join('\n')
      ),
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
    const stdout = withCliBanner(cwd, cliJs, result.stdout ?? '');
    const stderr = withCliBanner(cwd, cliJs, result.stderr ?? '');

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
      stdout: withCliBanner(cwd, cliJs, err.stdout ?? ''),
      stderr: withCliBanner(cwd, cliJs, detail),
      auditLine: `[MigrateGuard] ${input.label} failed via ${cmdKind}`,
    };
  }
}
