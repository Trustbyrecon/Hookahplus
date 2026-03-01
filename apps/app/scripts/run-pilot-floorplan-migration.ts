#!/usr/bin/env tsx
/**
 * Run pilot_configs + floorplan_layouts migration.
 * Uses app db connection (loads .env.local) so DATABASE_URL is available.
 *
 * Usage:
 *   npx tsx scripts/run-pilot-floorplan-migration.ts
 *
 * Run from apps/app directory.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { prisma } from '../lib/db';

async function main() {
  const sqlPath = resolve(__dirname, '../prisma/add_pilot_floorplan_tables.sql');
  const sql = readFileSync(sqlPath, 'utf-8');
  const statements = sql
    .split(';')
    .map((s) => s.replace(/--[^\n]*/g, '').trim())
    .filter((s) => s.length > 0);
  for (const stmt of statements) {
    await prisma.$executeRawUnsafe(stmt + ';');
  }
  console.log('✅ pilot_configs and floorplan_layouts tables created/verified');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
