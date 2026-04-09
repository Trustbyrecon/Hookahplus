/**
 * Server-only: runs Prisma CLI. Prefer direct `node …/prisma/build/index.js` so Vercel
 * serverless (where `npx` is often missing from PATH) still works.
 */

import { exec, execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

export interface MigrateGuardRunInput {
  label: string;
  command?: 'db_push' | 'migrate_deploy';
  /** App root (where prisma/schema.prisma lives). Defaults to process.cwd(). */
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

function prismaCliPath(cwd: string): string {
  return join(cwd, 'node_modules', 'prisma', 'build', 'index.js');
}

function resolveArgs(command: 'db_push' | 'migrate_deploy'): string[] {
  return command === 'migrate_deploy' ? ['migrate', 'deploy'] : ['db', 'push'];
}

function resolveShellCommand(command: 'db_push' | 'migrate_deploy'): string {
  if (command === 'migrate_deploy') {
    return 'npx prisma migrate deploy';
  }
  return 'npx prisma db push';
}

/**
 * Run Prisma via `node node_modules/prisma/build/index.js` when available (Vercel-friendly),
 * else fall back to shell `npx prisma …` (local dev / full shell).
 */
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
  };

  try {
    let stdout = '';
    let stderr = '';

    const cliJs = prismaCliPath(cwd);
    if (existsSync(cliJs)) {
      const result = await execFileAsync(process.execPath, [cliJs, ...args], {
        cwd,
        env,
        maxBuffer: 10 * 1024 * 1024,
      });
      stdout = result.stdout ?? '';
      stderr = result.stderr ?? '';
    } else {
      const shellCmd = resolveShellCommand(cmdKind);
      const result = await execAsync(shellCmd, {
        cwd,
        env,
        maxBuffer: 10 * 1024 * 1024,
      });
      stdout = result.stdout ?? '';
      stderr = result.stderr ?? '';
    }

    const finishedAt = new Date().toISOString();

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
