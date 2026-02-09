/**
 * E2E Test: UI Dashboard
 * 
 * Agent: EchoPrime
 * Objective: O5.4 - Test Suites
 */

import { test, expect } from '@playwright/test';

test.describe('UI Dashboard E2E', () => {
  test('Fire Session Dashboard loads and displays sessions', async ({ page }) => {
    await page.goto('/fire-session-dashboard');

    // Wait for dashboard to load
    await expect(page.getByText('Fire Session Dashboard').first()).toBeVisible({ timeout: 10000 });
  });

  test('Revenue dashboard displays metrics', async ({ page }) => {
    await page.goto('/revenue');

    // Wait for metrics to load
    await expect(page.getByRole('heading', { name: /Revenue Dashboard/i })).toBeVisible({ timeout: 10000 });
  });

  test('Reconciliation dashboard displays status', async ({ page }) => {
    await page.goto('/reconciliation');

    // Wait for dashboard to load
    await expect(page.getByRole('heading', { name: /POS Reconciliation Dashboard/i })).toBeVisible({ timeout: 10000 });
  });
});

