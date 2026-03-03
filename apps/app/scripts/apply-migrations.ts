/**
 * Script to apply all database migrations
 * Run with: npx tsx scripts/apply-migrations.ts
 */

import { PrismaClient } from '@prisma/client';
import { join } from 'path';
import { execSync } from 'child_process';
import { getDatabaseConnectionHints } from '../lib/db-helpers';

const prisma = new PrismaClient();

function uniqueNonEmpty(values: Array<string | undefined | null>): string[] {
  const out: string[] = [];
  for (const v of values) {
    const val = (v || '').trim();
    if (!val || out.includes(val)) continue;
    out.push(val);
  }
  return out;
}

function swapPort(url: string, fromPort: string, toPort: string): string {
  if (!url.includes(`:${fromPort}`)) return url;
  return url.replace(`:${fromPort}`, `:${toPort}`);
}

function migrationUrlCandidates(): string[] {
  const primary = (process.env.DATABASE_URL || '').trim();
  const direct = (process.env.DIRECT_URL || '').trim();
  const fallback = (process.env.DATABASE_URL_FALLBACK || '').trim();
  return uniqueNonEmpty([
    direct,
    primary,
    fallback,
    swapPort(direct, '5432', '6543'),
    swapPort(primary, '5432', '6543'),
    swapPort(fallback, '5432', '6543'),
    swapPort(direct, '6543', '5432'),
    swapPort(primary, '6543', '5432'),
    swapPort(fallback, '6543', '5432'),
  ]);
}

async function applyMigrations() {
  console.log('🚀 Applying database migrations...\n');

  try {
    const candidates = migrationUrlCandidates();
    if (!candidates.length) {
      throw new Error('No database URLs available. Set DATABASE_URL (and optionally DIRECT_URL / DATABASE_URL_FALLBACK).');
    }

    let lastError: unknown = null;
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      console.log(`Running: npx prisma migrate deploy (attempt ${i + 1}/${candidates.length})`);
      try {
        execSync('npx prisma migrate deploy', {
          cwd: join(process.cwd()),
          stdio: 'inherit',
          env: {
            ...process.env,
            DATABASE_URL: candidate,
            DIRECT_URL: candidate,
          }
        });
        console.log('\n✅ Migrations applied successfully!');
        return;
      } catch (error) {
        lastError = error;
        console.warn(`\n⚠️ Migration attempt ${i + 1} failed for this URL candidate.`);
      }
    }

    console.error('\n❌ All migration URL candidates failed.');
    const hints = getDatabaseConnectionHints({
      databaseUrl: process.env.DATABASE_URL,
      directUrl: process.env.DIRECT_URL,
      fallbackUrl: process.env.DATABASE_URL_FALLBACK,
    });
    for (const hint of hints) console.error(`- ${hint}`);
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigrations();

