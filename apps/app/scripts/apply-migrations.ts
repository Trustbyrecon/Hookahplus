/**
 * Script to apply all database migrations
 * Run with: npx tsx scripts/apply-migrations.ts
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function applyMigrations() {
  console.log('🚀 Applying database migrations...\n');

  try {
    // Use Prisma migrate deploy to apply all pending migrations
    console.log('Running: npx prisma migrate deploy');
    execSync('npx prisma migrate deploy', {
      cwd: join(process.cwd()),
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
        DIRECT_URL: process.env.DIRECT_URL,
      }
    });

    console.log('\n✅ Migrations applied successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigrations();

