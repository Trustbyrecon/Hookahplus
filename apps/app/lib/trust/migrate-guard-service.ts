import { prisma } from '../db';
import { logger } from '../logger';
import { runMigrateGuardedPrisma, type MigrateGuardRunResult } from './migrate-guard-runner';

export interface GuardedMigrationIntent {
  id: string;
  label: string;
  description: string;
  expectedChanges: string[];
  riskLevel: 'low' | 'medium' | 'high';
  command?: 'db_push' | 'migrate_deploy';
  /** Set by server action / API route for trust ledger */
  actorUserId?: string | null;
}

export interface GuardedMigrationResponse {
  ok: boolean;
  phase: 'precheck' | 'execute' | 'execute_failed' | 'verified' | 'verify_failed' | 'route_error';
  intent: GuardedMigrationIntent;
  result?: MigrateGuardRunResult;
  verified?: boolean;
  verificationError?: string | null;
  precheck?: { approved: boolean; reason: string };
  auditLine: string;
}

async function verifyCustomerMemoryTable(): Promise<boolean> {
  await prisma.$queryRawUnsafe(`SELECT 1 FROM customer_memory LIMIT 1`);
  return true;
}

async function persistMigrateGuardRun(args: {
  intent: GuardedMigrationIntent;
  response: GuardedMigrationResponse;
  defaultStartedAt: Date;
}): Promise<void> {
  const { intent, response, defaultStartedAt } = args;
  const startedAt = response.result?.startedAt
    ? new Date(response.result.startedAt)
    : defaultStartedAt;
  const finishedAt = response.result?.finishedAt
    ? new Date(response.result.finishedAt)
    : new Date();

  try {
    await prisma.migrateGuardRun.create({
      data: {
        intentId: intent.id,
        label: intent.label,
        actorUserId: intent.actorUserId ?? null,
        ok: response.ok,
        phase: response.phase,
        auditLine: response.auditLine,
        stdout: response.result?.stdout ?? null,
        stderr: response.result?.stderr ?? null,
        startedAt,
        finishedAt,
      },
    });
  } catch (e: unknown) {
    logger.warn('[MigrateGuard] Failed to persist run ledger', {
      component: 'migrate-guard',
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

export async function executeGuardedMigration(
  intent: GuardedMigrationIntent
): Promise<GuardedMigrationResponse> {
  const defaultStartedAt = new Date();

  const finalize = async (response: GuardedMigrationResponse): Promise<GuardedMigrationResponse> => {
    await persistMigrateGuardRun({ intent, response, defaultStartedAt });
    return response;
  };

  const precheck = {
    approved: true as boolean,
    reason: 'Additive schema change path (db push / migrate deploy). Review intent.expectedChanges before production.',
  };

  if (intent.riskLevel === 'high') {
    precheck.approved = false;
    precheck.reason = 'High-risk intents are blocked by MigrateGuard v1 — use a manual DBA run.';
    return finalize({
      ok: false,
      phase: 'precheck',
      intent,
      precheck,
      auditLine: `[MigrateGuard] Blocked ${intent.id}: ${precheck.reason}`,
    });
  }

  const result = await runMigrateGuardedPrisma({
    label: intent.label,
    command: intent.command ?? 'db_push',
  });

  logger.info(result.auditLine, { component: 'migrate-guard', intentId: intent.id });

  if (!result.ok) {
    return finalize({
      ok: false,
      phase: 'execute_failed',
      intent,
      result,
      auditLine: result.auditLine,
    });
  }

  let verified = true;
  let verificationError: string | null = null;

  try {
    if (intent.id === 'add_customer_memory_v1') {
      verified = await verifyCustomerMemoryTable();
    }
  } catch (e: unknown) {
    verified = false;
    verificationError = e instanceof Error ? e.message : 'Verification query failed';
  }

  return finalize({
    ok: result.ok && verified,
    phase: verified ? 'verified' : 'verify_failed',
    intent,
    result,
    verified,
    verificationError,
    auditLine: verified
      ? `${result.auditLine} (post-check OK)`
      : `${result.auditLine} (post-check failed: ${verificationError ?? 'unknown'})`,
  });
}
