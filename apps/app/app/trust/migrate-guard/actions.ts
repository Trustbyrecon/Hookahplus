'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser, hasRole } from '@/lib/auth';
import { executeGuardedMigration } from '@/lib/trust/migrate-guard-service';

export interface RunCustomerMemoryMigrationActionState {
  ok: boolean;
  message: string;
  auditLine?: string;
  phase?: string;
  stdout?: string;
  stderr?: string;
  verificationError?: string | null;
}

const DEFAULT_STATE: RunCustomerMemoryMigrationActionState = {
  ok: false,
  message: '',
};

export async function runCustomerMemoryMigrationAction(
  _prevState: RunCustomerMemoryMigrationActionState = DEFAULT_STATE,
  _formData?: FormData
): Promise<RunCustomerMemoryMigrationActionState> {
  const writesEnabled = process.env.ENABLE_MIGRATE_GUARD_WRITE === 'true';

  if (!writesEnabled) {
    return {
      ok: false,
      message: 'MigrateGuard writes are disabled. Set ENABLE_MIGRATE_GUARD_WRITE=true.',
      phase: 'blocked',
    };
  }

  const user = await getCurrentUser(undefined);
  if (!user) {
    return {
      ok: false,
      message: 'You must be signed in to run guarded migrations.',
      phase: 'forbidden',
    };
  }

  const allowed = await hasRole(undefined, ['owner', 'admin']);
  if (!allowed) {
    return {
      ok: false,
      message: 'You do not have permission to run guarded migrations (owner or admin required).',
      phase: 'forbidden',
    };
  }

  const result = await executeGuardedMigration({
    id: 'add_customer_memory_v1',
    label: 'customer_memory_init',
    description: 'Add CustomerMemory table for H+ Operator CLARK write-back',
    expectedChanges: ['customer_memory table'],
    riskLevel: 'low',
    command: 'db_push',
    actorUserId: user.id,
  });

  revalidatePath('/trust/migrate-guard');

  return {
    ok: result.ok,
    message: result.ok
      ? 'CustomerMemory migration completed.'
      : 'CustomerMemory migration failed.',
    auditLine: result.auditLine,
    phase: result.phase,
    stdout: result.result?.stdout ?? '',
    stderr: result.result?.stderr ?? '',
    verificationError: result.verificationError ?? null,
  };
}
