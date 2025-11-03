/**
 * E2E Test: POS Reconciliation
 * 
 * Agent: EchoPrime
 * Objective: O5.4 - Test Suites
 */

import { test, expect } from '@playwright/test';

test.describe('POS Reconciliation E2E', () => {
  test('POS ticket creation and reconciliation', async ({ page }) => {
    // Step 1: Create POS ticket via API
    const ticketResponse = await page.request.post('/api/pos/tickets', {
      data: {
        ticketId: 'TEST-POS-RECONCILE-001',
        sessionId: 'test-session-reconcile-001',
        amountCents: 3500,
        status: 'paid',
        posSystem: 'square',
        items: JSON.stringify([
          { name: 'Hookah Session', price: 3000 },
          { name: 'Mint Flavor', price: 500 },
        ]),
      },
    });

    expect(ticketResponse.ok()).toBeTruthy();

    // Step 2: Run reconciliation job
    const reconcileResponse = await page.request.post('/api/pos/reconcile');

    expect(reconcileResponse.ok()).toBeTruthy();
    const reconcileData = await reconcileResponse.json();
    expect(reconcileData.success).toBe(true);
    expect(reconcileData.data.reconciliationRate).toBeGreaterThanOrEqual(0);
  });

  test('Reconciliation dashboard displays metrics', async ({ page }) => {
    await page.goto('/reconciliation');

    // Wait for metrics to load
    await page.waitForSelector('text=Reconciliation Rate', { timeout: 5000 });

    // Check that key metrics are displayed
    await expect(page.getByText(/Reconciliation Rate/i)).toBeVisible();
    await expect(page.getByText(/Pricing Parity/i)).toBeVisible();
    await expect(page.getByText(/Matches/i)).toBeVisible();
  });
});

