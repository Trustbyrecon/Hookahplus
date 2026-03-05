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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
  || 'http://localhost:3002';

async function main() {
  const checks: { name: string; ok: boolean; detail?: string }[] = [];

  // 1. DATABASE_URL
  checks.push({
    name: 'DATABASE_URL set',
    ok: !!process.env.DATABASE_URL,
    detail: process.env.DATABASE_URL ? 'Configured' : 'Not set',
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

  // 4. CODIGO config (layoutMode)
  try {
    const configRes = await fetch(`${APP_URL}/api/lounges/CODIGO/config`);
    const configData = configRes.ok ? await configRes.json() : null;
    const layoutMode = configData?.config?.layoutMode;
    checks.push({
      name: 'GET /api/lounges/CODIGO/config',
      ok: configRes.ok && (layoutMode === 'floor' || layoutMode === 'classic'),
      detail: configRes.ok ? `layoutMode=${layoutMode}` : `${configRes.status}`,
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
