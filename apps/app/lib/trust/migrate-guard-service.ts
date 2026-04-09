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

export async function executeGuardedMigration(
  intent: GuardedMigrationIntent
): Promise<GuardedMigrationResponse> {
  const precheck = {
    approved: true as boolean,
    reason: 'Additive schema change path (db push / migrate deploy). Review intent.expectedChanges before production.',
  };

  if (intent.riskLevel === 'high') {
    precheck.approved = false;
    precheck.reason = 'High-risk intents are blocked by MigrateGuard v1 — use a manual DBA run.';
    return {
      ok: false,
      phase: 'precheck',
      intent,
      precheck,
      auditLine: `[MigrateGuard] Blocked ${intent.id}: ${precheck.reason}`,
    };
  }

  const result = await runMigrateGuardedPrisma({
    label: intent.label,
    command: intent.command ?? 'db_push',
  });

  logger.info(result.auditLine, { component: 'migrate-guard', intentId: intent.id });

  if (!result.ok) {
    return {
      ok: false,
      phase: 'execute_failed',
      intent,
      result,
      auditLine: result.auditLine,
    };
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

  return {
    ok: result.ok && verified,
    phase: verified ? 'verified' : 'verify_failed',
    intent,
    result,
    verified,
    verificationError,
    auditLine: verified
      ? `${result.auditLine} (post-check OK)`
      : `${result.auditLine} (post-check failed: ${verificationError ?? 'unknown'})`,
  };
}
