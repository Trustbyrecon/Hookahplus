#!/usr/bin/env tsx
/**
 * Verify CODIGO pilot infrastructure is ready.
 * Run from apps/app: npx tsx scripts/verify-codigo-pilot.ts
 *
 * Checks:
 * - DATABASE_URL is set
 * - /api/health returns 200
 * - /api/lounges/CODIGO/layout returns layout (requires seed)
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local so DATABASE_URL and NEXT_PUBLIC_APP_URL are available (matches seed script)
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
  || 'http://localhost:3002';

async function main() {
  const checks: { name: string; ok: boolean; detail?: string }[] = [];

  // 1. DATABASE_URL (only relevant when running locally / seeding)
  const isRemote = APP_URL && !APP_URL.includes('localhost');
  checks.push({
    name: 'DATABASE_URL set',
    ok: isRemote || !!process.env.DATABASE_URL,
    detail: process.env.DATABASE_URL ? 'Configured' : (isRemote ? 'N/A (remote verify)' : 'Not set'),
  });

  // 2. Health endpoint (requires server running)
  try {
    const healthRes = await fetch(`${APP_URL}/api/health`);
    checks.push({
      name: 'GET /api/health',
      ok: healthRes.ok,
      detail: `${healthRes.status} ${healthRes.statusText}`,
    });
  } catch (e) {
    checks.push({
      name: 'GET /api/health',
      ok: false,
      detail: e instanceof Error ? e.message : 'Fetch failed',
    });
  }

  // 3. CODIGO layout (requires seed)
  try {
    const layoutRes = await fetch(`${APP_URL}/api/lounges/CODIGO/layout`);
    const data = layoutRes.ok ? await layoutRes.json() : null;
    const nodes = data?.nodes ?? data?.layout?.nodes ?? [];
    const seats = data?.layout?.seats ?? data?.seats ?? [];
    const hasLayout = nodes.length > 0 || seats.length > 0;
    checks.push({
      name: 'GET /api/lounges/CODIGO/layout',
      ok: layoutRes.ok && hasLayout,
      detail: layoutRes.ok
        ? (hasLayout ? `Layout has ${nodes.length || seats.length} nodes/seats` : 'Empty layout - run seed')
        : `${layoutRes.status}`,
    });
  } catch (e) {
    checks.push({
      name: 'GET /api/lounges/CODIGO/layout',
      ok: false,
      detail: e instanceof Error ? e.message : 'Fetch failed',
    });
  }

  // 4. CODIGO config (layoutMode) — required for FSD Floor tab
  try {
    const configRes = await fetch(`${APP_URL}/api/lounges/CODIGO/config`);
    const configData = configRes.ok ? await configRes.json() : null;
    const layoutMode = configData?.config?.layoutMode;
    const hasLayoutMode = layoutMode === 'floor' || layoutMode === 'classic';
    const configOk = configRes.ok && hasLayoutMode;
    let detail = configRes.ok ? `layoutMode=${layoutMode ?? 'undefined'}` : `${configRes.status}`;
    if (configRes.ok && !hasLayoutMode) {
      detail += ' — deploy latest app build (config route must include layoutMode for FSD Floor tab)';
    }
    checks.push({
      name: 'GET /api/lounges/CODIGO/config',
      ok: configOk,
      detail,
    });
  } catch (e) {
    checks.push({
      name: 'GET /api/lounges/CODIGO/config',
      ok: false,
      detail: e instanceof Error ? e.message : 'Fetch failed',
    });
  }

  // Report
  console.log('\nCODIGO Pilot Verification\n');
  checks.forEach((c) => {
    const icon = c.ok ? '✓' : '✗';
    console.log(`  ${icon} ${c.name}: ${c.detail || (c.ok ? 'OK' : 'FAIL')}`);
  });
  const allOk = checks.every((c) => c.ok);
  console.log(allOk ? '\nAll checks passed.\n' : '\nSome checks failed. Run migrations and seed if needed.\n');
  process.exit(allOk ? 0 : 1);
}

main();
