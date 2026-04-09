/**
 * Server-only: runs Prisma CLI via shell for cross-platform (incl. Windows npx).
 * Import only from API routes or other server code — never from client components.
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

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

function resolveShellCommand(command: 'db_push' | 'migrate_deploy'): string {
  if (command === 'migrate_deploy') {
    return 'npx prisma migrate deploy';
  }
  return 'npx prisma db push';
}

export async function runMigrateGuardedPrisma(
  input: MigrateGuardRunInput
): Promise<MigrateGuardRunResult> {
  const startedAt = new Date().toISOString();
  const cmdKind = input.command ?? 'db_push';
  const shellCmd = resolveShellCommand(cmdKind);
  const cwd = input.cwd ?? process.cwd();

  try {
    const { stdout, stderr } = await execAsync(shellCmd, {
      cwd,
      env: {
        ...process.env,
        CI: 'true',
      },
      maxBuffer: 10 * 1024 * 1024,
    });

    const finishedAt = new Date().toISOString();

    return {
      ok: true,
      label: input.label,
      command: cmdKind,
      startedAt,
      finishedAt,
      stdout: stdout ?? '',
      stderr: stderr ?? '',
      auditLine: `[MigrateGuard] ${input.label} succeeded via ${cmdKind}`,
    };
  } catch (error: unknown) {
    const finishedAt = new Date().toISOString();
    const err = error as {
      stdout?: string;
      stderr?: string;
      message?: string;
    };

    return {
      ok: false,
      label: input.label,
      command: cmdKind,
      startedAt,
      finishedAt,
      stdout: err.stdout ?? '',
      stderr: err.stderr ?? err.message ?? 'Unknown migrate failure',
      auditLine: `[MigrateGuard] ${input.label} failed via ${cmdKind}`,
    };
  }
}
