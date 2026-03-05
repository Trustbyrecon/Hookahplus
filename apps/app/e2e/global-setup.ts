/**
 * Playwright global setup: seed CODIGO pilot before E2E tests.
 * Ensures codigo-pilot and codigo-checklist specs have layout, config, tables.
 * Skips when SKIP_CODIGO_SEED=1 or DATABASE_URL is unset.
 */
import { execSync } from 'child_process';
import path from 'path';

export default async function globalSetup() {
  if (process.env.SKIP_CODIGO_SEED === '1') return;
  if (!process.env.DATABASE_URL) {
    console.warn('[CODIGO E2E] DATABASE_URL not set; skipping seed. Run npx tsx scripts/seed-codigo-pilot.ts manually.');
    return;
  }
  const appDir = path.resolve(__dirname, '..');
  try {
    execSync('npx tsx scripts/seed-codigo-pilot.ts', {
      cwd: appDir,
      stdio: 'inherit',
      env: { ...process.env },
    });
  } catch (e) {
    console.warn('[CODIGO E2E] Seed failed. Tests may skip or fail. Run: npx tsx scripts/seed-codigo-pilot.ts');
  }
}
