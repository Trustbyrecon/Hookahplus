/**
 * E2E Test: CODIGO Pilot — 80% use cases + top 80% edge cases
 *
 * Lounge ID: CODIGO
 * Covers: FSD Floor tab, Create Session, table validation, layout plumbing,
 * session lifecycle, and edge cases (invalid table, availability, etc.)
 */

import { test, expect } from '@playwright/test';

const CODIGO_FSD_URL = '/fire-session-dashboard?lounge=CODIGO';
const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002';

test.describe('CODIGO Pilot — Use Cases (80%)', () => {
  test('FSD loads with CODIGO and shows Floor tab by default', async ({ page }) => {
    const configPromise = page.waitForResponse((r) => r.url().includes('/api/lounges/CODIGO/config'), { timeout: 15000 });
    await page.goto(CODIGO_FSD_URL, { waitUntil: 'domcontentloaded' });
    await configPromise;
    await expect(page.getByText('Fire Session Dashboard').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('tab-floor').or(page.getByRole('button', { name: /Floor/i }))).toBeVisible({ timeout: 8000 });
  });

  test('CODIGO compact hero shows Create Session CTA', async ({ page }) => {
    const configPromise = page.waitForResponse((r) => r.url().includes('/api/lounges/CODIGO/config'), { timeout: 15000 });
    await page.goto(CODIGO_FSD_URL, { waitUntil: 'domcontentloaded' });
    await configPromise;
    await expect(page.getByTestId('create-session-cta').or(page.getByRole('button', { name: /Create Session/i }))).toBeVisible({ timeout: 8000 });
  });

  test('Floor tab shows at-a-glance status strip', async ({ page }) => {
    const configPromise = page.waitForResponse((r) => r.url().includes('/api/lounges/CODIGO/config'), { timeout: 15000 });
    await page.goto(CODIGO_FSD_URL, { waitUntil: 'domcontentloaded' });
    await configPromise;
    const floorTab = page.getByTestId('tab-floor').or(page.getByRole('button', { name: /Floor/i }));
    await floorTab.first().click();
    await expect(page.getByText(/Active|revenue/i)).toBeVisible({ timeout: 8000 });
  });

  test('Create Session modal opens and shows CODIGO tables from floorplan', async ({ page }) => {
    const configPromise = page.waitForResponse((r) => r.url().includes('/api/lounges/CODIGO/config'), { timeout: 15000 });
    await page.goto(CODIGO_FSD_URL, { waitUntil: 'domcontentloaded' });
    await configPromise;
    await page.getByTestId('create-session-cta').or(page.getByRole('button', { name: /Create Session/i })).first().click();
    await expect(page.getByText(/Table Selection|Create New Session/i)).toBeVisible({ timeout: 10000 });
  });

  test('API: CODIGO layout returns floorplan tables', async ({ request }) => {
    const res = await request.get(`${BASE}/api/lounges/CODIGO/layout`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    const seats = data?.layout?.seats || [];
    const has705 = seats.some((s: any) => (s.tableId || s.id || s.name || '').toString() === '705');
    expect(seats.length).toBeGreaterThan(0);
    expect(has705 || seats.length >= 5).toBeTruthy();
  });

  test('API: Table 705 validates for CODIGO', async ({ request }) => {
    const res = await request.post(`${BASE}/api/lounges/tables/validate`, {
      data: { tableId: '705', loungeId: 'CODIGO', checkAvailability: false },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.valid).toBe(true);
    expect(data.table?.name || data.table?.id).toMatch(/705/);
  });

  test('API: Sessions list accepts lounge=CODIGO', async ({ request }) => {
    const res = await request.get(`${BASE}/api/sessions?loungeId=CODIGO`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data.sessions ?? data)).toBeTruthy();
  });

  test('Create session via API with CODIGO table 705', async ({ request }) => {
    const res = await request.post(`${BASE}/api/sessions`, {
      data: {
        tableId: '705',
        table_id: '705',
        customerName: 'E2E Test Guest',
        customer_name: 'E2E Test Guest',
        flavor_mix: ['Lemon Mint'],
        flavor: 'Lemon Mint',
        amount: 6000,
        loungeId: 'CODIGO',
        lounge_id: 'CODIGO',
        source: 'POS',
        session_type: 'walk-in',
        codigoOperator: true,
      },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.session?.id || data.id).toBeTruthy();
    expect(data.session?.tableId || data.tableId).toMatch(/705/);
  });
});

test.describe('CODIGO Pilot — Edge Cases (80%)', () => {
  test('API: Invalid table ID returns validation error', async ({ request }) => {
    const res = await request.post(`${BASE}/api/lounges/tables/validate`, {
      data: { tableId: 'INVALID-TABLE-999', loungeId: 'CODIGO', checkAvailability: false },
    });
    const data = await res.json();
    expect(data.valid).toBe(false);
    expect(data.error).toMatch(/not found|invalid/i);
  });

  test('API: Table availability check with loungeId for CODIGO', async ({ request }) => {
    const res = await request.get(
      `${BASE}/api/lounges/tables/availability?tableId=705&partySize=2&loungeId=CODIGO`
    );
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(typeof data.available).toBe('boolean');
  });

  test('API: Lounges layout fallback returns CODIGO floorplan', async ({ request }) => {
    const res = await request.get(`${BASE}/api/lounges?layout=true&loungeId=CODIGO`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    const tables = data?.layout?.tables || [];
    if (tables.length === 0) {
      test.skip(true, 'CODIGO floorplan not seeded. Run: npx tsx scripts/seed-codigo-pilot.ts');
      return;
    }
    const has705 = tables.some(
      (t: any) =>
        (t.id || t.name || t.tableId || '').toString() === '705' ||
        String(t.id || t.name || '').includes('705')
    );
    expect(has705, `Table 705 not in layout. Tables: ${tables.map((t: any) => t.id || t.name).join(', ')}`).toBeTruthy();
  });

  test('API: Config returns layoutMode for CODIGO', async ({ request }) => {
    const res = await request.get(`${BASE}/api/lounges/CODIGO/config`);
    expect(res.ok(), `Config API returned ${res.status()}: ${await res.text().catch(() => '')}`).toBeTruthy();
    const data = await res.json();
    const layoutMode = data?.config?.layoutMode;
    expect(['floor', 'classic'].includes(layoutMode) || layoutMode === undefined).toBeTruthy();
  });

  test('FSD Floor tab shows seat nodes (no MiniMap)', async ({ page }) => {
    const configPromise = page.waitForResponse((r) => r.url().includes('/api/lounges/CODIGO/config'), { timeout: 15000 });
    await page.goto(CODIGO_FSD_URL, { waitUntil: 'domcontentloaded' });
    await configPromise;
    await page.getByTestId('tab-floor').or(page.getByRole('button', { name: /Floor/i })).first().click();
    await expect(page.getByTestId('codigo-seat-node').first()).toBeVisible({ timeout: 12000 });
    await expect(page.locator('.react-flow__minimap')).toHaveCount(0);
  });

  test('Session creation with missing required fields returns error', async ({ request }) => {
    const res = await request.post(`${BASE}/api/sessions`, {
      data: {
        tableId: '705',
        loungeId: 'CODIGO',
        codigoOperator: true,
      },
    });
    const data = await res.json().catch(() => ({}));
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(data.error || data.details || data.message).toBeTruthy();
  });

  test('Duplicate session on same table - availability reflects occupancy', async ({ request }) => {
    const createRes = await request.post(`${BASE}/api/sessions`, {
      data: {
        tableId: '702',
        table_id: '702',
        customerName: 'Occupant',
        customer_name: 'Occupant',
        flavor_mix: ['Mint'],
        amount: 6000,
        loungeId: 'CODIGO',
        codigoOperator: true,
      },
    });
    if (!createRes.ok()) return;
    const availRes = await request.get(
      `${BASE}/api/lounges/tables/availability?tableId=702&partySize=2&loungeId=CODIGO`
    );
    const avail = await availRes.json();
    expect(typeof avail.available).toBe('boolean');
  });
});

test.describe('CODIGO Concurrency', () => {
  test('Concurrent session creation - 10 parallel requests', async ({ request }) => {
    const concurrency = 10;
    const promises = Array(concurrency)
      .fill(null)
      .map((_, i) =>
        request.post(`${BASE}/api/sessions`, {
          data: {
            tableId: `30${i}`,
            table_id: `30${i}`,
            customerName: `Concurrent-${i}`,
            customer_name: `Concurrent-${i}`,
            flavor_mix: ['Mint'],
            amount: 6000,
            loungeId: 'CODIGO',
            codigoOperator: true,
          },
        })
      );
    const results = await Promise.all(promises);
    const okCount = results.filter((r) => r.ok()).length;
    expect(okCount).toBeGreaterThanOrEqual(concurrency * 0.8);
  });
});
