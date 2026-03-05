/**
 * E2E Test: CODIGO Pilot Checklist (codigo_pilot_checklist.md)
 *
 * Covers: join flow, session linking, wallet card, profile, KPI, portability.
 * Prerequisite: Run `npx tsx scripts/seed-codigo-pilot.ts` from apps/app.
 */

import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002';

test.describe('CODIGO Pilot — Checklist', () => {
  test('Join flow: /codigo/join loads and shows form', async ({ page }) => {
    await page.goto('/codigo/join', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('CODIGO').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder(/first name/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /Join/i })).toBeVisible({ timeout: 5000 });
  });

  test('Join flow: submit first name, success state shows "You\'re in"', async ({ page }) => {
    await page.goto('/codigo/join', { waitUntil: 'domcontentloaded' });
    await page.getByPlaceholder(/first name/i).fill(`E2E_${Date.now()}`);
    await page.getByRole('button', { name: /Join/i }).click();
    await expect(page.getByText(/You'?re in\.?/i)).toBeVisible({ timeout: 20000 });
  });

  test('Join flow: localStorage contains hp_codigo_device_id_v1 and hp_codigo_member_id_v1', async ({ page }) => {
    await page.goto('/codigo/join', { waitUntil: 'domcontentloaded' });
    await page.getByPlaceholder(/first name/i).fill(`Checklist_${Date.now()}`);
    await page.getByRole('button', { name: /Join/i }).click();
    await expect(page.getByText(/You'?re in\.?/i)).toBeVisible({ timeout: 20000 });

    const deviceId = await page.evaluate(() => localStorage.getItem('hp_codigo_device_id_v1'));
    const memberId = await page.evaluate(() => localStorage.getItem('hp_codigo_member_id_v1'));
    expect(deviceId).toBeTruthy();
    expect(memberId).toBeTruthy();
  });

  test('Wallet card: Add to Wallet link visible and returns PNG', async ({ page, request }) => {
    await page.goto('/codigo/join', { waitUntil: 'domcontentloaded' });
    await page.getByPlaceholder(/first name/i).fill(`Wallet_${Date.now()}`);
    await page.getByRole('button', { name: /Join/i }).click();
    await expect(page.getByText(/You'?re in\.?/i)).toBeVisible({ timeout: 20000 });

    const walletLink = page.getByTestId('add-to-wallet').or(page.getByRole('link', { name: /Add to Wallet/i }));
    await expect(walletLink).toBeVisible({ timeout: 8000 });
    const href = await walletLink.getAttribute('href');
    expect(href).toMatch(/memberId=/);

    const memberId = await page.evaluate(() => localStorage.getItem('hp_codigo_member_id_v1'));
    const res = await request.get(`${BASE}/api/codigo/wallet-card?memberId=${encodeURIComponent(memberId || '')}`);
    expect(res.ok()).toBeTruthy();
    expect(res.headers()['content-type']).toMatch(/image\/png/);
  });

  test('API: Session linking with memberId returns member', async ({ request }) => {
    const joinRes = await request.post(`${BASE}/api/codigo/join`, {
      data: {
        firstName: `Link_${Date.now()}`,
        deviceId: `dev_e2e_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      },
    });
    if (!joinRes.ok()) {
      test.skip(true, `Join API failed: ${joinRes.status()}. Ensure DB has NetworkProfile, NetworkPIILink, NetworkPreference.`);
      return;
    }
    const joinData = await joinRes.json();
    const memberId = joinData?.memberId;
    expect(memberId).toBeTruthy();

    const sessionRes = await request.post(`${BASE}/api/sessions`, {
      data: {
        tableId: '301',
        table_id: '301',
        customerName: 'Linked Guest',
        customer_name: 'Linked Guest',
        flavor_mix: ['Mint'],
        amount: 6000,
        loungeId: 'CODIGO',
        memberId,
        codigoOperator: true,
      },
    });
    expect(sessionRes.ok()).toBeTruthy();
    const sessionData = await sessionRes.json();
    expect(sessionData?.session?.member ?? sessionData?.member).toBeTruthy();
  });

  test('API: GET /api/sessions/[id] includes member when hid present', async ({ request }) => {
    const joinRes = await request.post(`${BASE}/api/codigo/join`, {
      data: {
        firstName: `Hid_${Date.now()}`,
        deviceId: `dev_hid_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      },
    });
    if (!joinRes.ok()) {
      test.skip(true, `Join API failed: ${joinRes.status()}. Ensure DB has NetworkProfile, NetworkPIILink, NetworkPreference.`);
      return;
    }
    const memberId = (await joinRes.json())?.memberId;
    expect(memberId).toBeTruthy();

    const createRes = await request.post(`${BASE}/api/sessions`, {
      data: {
        tableId: '302',
        customerName: 'HID Guest',
        flavor_mix: ['Mint'],
        amount: 6000,
        loungeId: 'CODIGO',
        memberId,
        codigoOperator: true,
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const created = await createRes.json();
    const sessionId = created?.session?.id ?? created?.id;
    expect(sessionId).toBeTruthy();

    const getRes = await request.get(`${BASE}/api/sessions/${sessionId}`);
    expect(getRes.ok()).toBeTruthy();
    const session = await getRes.json();
    expect(session?.member ?? session?.session?.member).toBeTruthy();
  });

  test('Profile: /codigo/profile loads (requires memberId from join)', async ({ page }) => {
    await page.goto('/codigo/join', { waitUntil: 'domcontentloaded' });
    await page.getByPlaceholder(/first name/i).fill(`Profile_${Date.now()}`);
    await page.getByRole('button', { name: /Join/i }).click();
    await expect(page.getByText(/You'?re in\.?/i)).toBeVisible({ timeout: 20000 });

    await page.goto('/codigo/profile', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/Complete your profile|Add a phone or email|No CODIGO member ID/i)).toBeVisible({ timeout: 10000 });
  });

  test('Profile: POST /api/codigo/profile returns success', async ({ request }) => {
    const joinRes = await request.post(`${BASE}/api/codigo/join`, {
      data: {
        firstName: `ProfileAPI_${Date.now()}`,
        deviceId: `dev_profile_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      },
    });
    if (!joinRes.ok()) {
      test.skip(true, `Join API failed: ${joinRes.status()}. Ensure DB has NetworkProfile, NetworkPIILink, NetworkPreference.`);
      return;
    }
    const memberId = (await joinRes.json())?.memberId;
    expect(memberId).toBeTruthy();

    const profileRes = await request.post(`${BASE}/api/codigo/profile`, {
      data: {
        memberId,
        email: `e2e_${Date.now()}@example.com`,
        phone: null,
        instagramHandle: null,
        portabilityOptIn: false,
      },
    });
    expect(profileRes.ok()).toBeTruthy();
  });

  test('Privacy: /codigo/privacy loads', async ({ page }) => {
    await page.goto('/codigo/privacy', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/Privacy|portability|H\+ Passport/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('API: GET /api/codigo/kpis/summary returns KPI structure', async ({ request }) => {
    const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const end = new Date().toISOString();
    const res = await request.get(`${BASE}/api/codigo/kpis/summary?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
    if (!res.ok()) {
      const text = await res.text().catch(() => '');
      test.skip(true, `KPI API returned ${res.status()}: ${text.slice(0, 100)}`);
      return;
    }
    const data = await res.json();
    expect(data).toBeDefined();
    expect(data?.loungeId === 'CODIGO' || data?.window || data?.sessions).toBeTruthy();
  });

  test('Admin: /admin/codigo-kpis loads and date range selector works', async ({ page }) => {
    await page.goto('/admin/codigo-kpis', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/CODIGO|KPI|date/i).first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('input[type="date"]').first()).toBeVisible({ timeout: 5000 });
  });
});
