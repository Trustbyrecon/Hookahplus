/**
 * Automation / curl path for MigrateGuard. Requires optional x-migrate-guard-secret when
 * MIGRATE_GUARD_SECRET is set. The `/trust/migrate-guard` UI uses a server action instead
 * (same executeGuardedMigration core, no browser secret).
 */
import { NextRequest, NextResponse } from 'next/server';
import { hasRole } from '../../../../../lib/auth';
import { executeGuardedMigration } from '../../../../../lib/trust/migrate-guard-service';
import { logger } from '../../../../../lib/logger';

export const runtime = 'nodejs';

function migrateGuardEnabled(): boolean {
  return process.env.ENABLE_MIGRATE_GUARD_WRITE === 'true';
}

function secretOk(req: NextRequest): boolean {
  const secret = process.env.MIGRATE_GUARD_SECRET;
  if (!secret || !secret.trim()) {
    return true;
  }
  const h = req.headers.get('x-migrate-guard-secret');
  return h === secret.trim();
}

export async function POST(req: NextRequest) {
  if (!migrateGuardEnabled()) {
    return NextResponse.json(
      {
        ok: false,
        phase: 'precheck',
        auditLine: '[MigrateGuard] Writes disabled (set ENABLE_MIGRATE_GUARD_WRITE=true).',
      },
      { status: 403 }
    );
  }

  if (!secretOk(req)) {
    return NextResponse.json(
      {
        ok: false,
        phase: 'precheck',
        auditLine: '[MigrateGuard] Invalid or missing x-migrate-guard-secret.',
      },
      { status: 403 }
    );
  }

  const allowed = await hasRole(req, ['owner', 'admin']);
  if (!allowed) {
    return NextResponse.json(
      {
        ok: false,
        phase: 'precheck',
        auditLine: '[MigrateGuard] Requires owner or admin role.',
      },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();

    const id =
      typeof body?.id === 'string' && body.id.trim() ? body.id.trim() : 'migration_run';

    const label =
      typeof body?.label === 'string' && body.label.trim()
        ? body.label.trim()
        : id;

    const description =
      typeof body?.description === 'string' && body.description.trim()
        ? body.description.trim()
        : 'Guarded schema change';

    const expectedChanges = Array.isArray(body?.expectedChanges)
      ? body.expectedChanges.filter((v: unknown): v is string => typeof v === 'string')
      : [];

    const riskLevel =
      body?.riskLevel === 'medium' || body?.riskLevel === 'high' ? body.riskLevel : 'low';

    const command =
      body?.command === 'migrate_deploy' ? 'migrate_deploy' : 'db_push';

    const result = await executeGuardedMigration({
      id,
      label,
      description,
      expectedChanges,
      riskLevel,
      command,
    });

    logger.info(result.auditLine, {
      component: 'migrate-guard',
      intentId: id,
      ok: result.ok,
      phase: result.phase,
    });

    return NextResponse.json(result, {
      status: result.ok ? 200 : 500,
    });
  } catch (error) {
    logger.error('[MigrateGuard] Route error', {
      component: 'migrate-guard',
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        ok: false,
        phase: 'route_error',
        auditLine: '[MigrateGuard] Route execution failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
