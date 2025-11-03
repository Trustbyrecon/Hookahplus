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
    await page.waitForSelector('text=Fire Session Dashboard', { timeout: 5000 });

    // Check that session list is displayed
    await expect(page.getByText(/Session/i)).toBeVisible();
  });

  test('Revenue dashboard displays metrics', async ({ page }) => {
    await page.goto('/revenue');

    // Wait for metrics to load
    await page.waitForSelector('text=Revenue', { timeout: 5000 });

    // Check that revenue metrics are displayed
    await expect(page.getByText(/Today/i)).toBeVisible();
    await expect(page.getByText(/Week/i)).toBeVisible();
  });

  test('Reconciliation dashboard displays status', async ({ page }) => {
    await page.goto('/reconciliation');

    // Wait for dashboard to load
    await page.waitForSelector('text=POS Reconciliation Dashboard', { timeout: 5000 });

    // Check that reconciliation metrics are displayed
    await expect(page.getByText(/Reconciliation Rate/i)).toBeVisible();
  });
});

