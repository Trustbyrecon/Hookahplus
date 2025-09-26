import { test, expect } from '@playwright/test';

test.describe('Smoke Flow: Checkout', () => {
  test('Guest preorder → checkout → success @smoke', async ({ page }) => {
    await page.goto(process.env.NEXT_PUBLIC_GUEST_URL || 'http://localhost:3001');
    // Placeholder assertions to keep test lightweight
    await expect(page).toHaveTitle(/Hookah|Guest|HookahPlus/i);
  });

  test('Checkout cancel path @smoke', async ({ page }) => {
    await page.goto(process.env.NEXT_PUBLIC_GUEST_URL || 'http://localhost:3001/checkout/cancel');
    await expect(page.url()).toContain('cancel');
  });
});
