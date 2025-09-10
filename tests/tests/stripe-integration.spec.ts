import { test, expect } from '@playwright/test';
import { Agent, PlanSchema } from '../src/agent';
import { 
  waitForApiResponse, 
  mockApiResponse, 
  simulateStripeSuccess, 
  simulateStripeCancel,
  clearAllMocks 
} from '../src/advanced-skills';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Hookah+ — Stripe Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing mocks before each test
    await clearAllMocks(page);
  });

  test('Deposit flow with successful Stripe payment', async ({ page }) => {
    // Mock successful Stripe checkout
    await simulateStripeSuccess(page);
    
    // Mock API responses
    await mockApiResponse(page, '**/api/checkout/deposit', {
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/test',
      client_secret: 'cs_test_123_secret'
    });

    await page.goto(`${BASE}/reserve`);
    
    // Fill out reservation form
    await page.fill('input[name=partySize]', '4');
    await page.fill('input[name=slotStartIso]', '2025-09-10T18:30');
    await page.fill('input[name=slotEndIso]', '2025-09-10T20:00');
    
    // Click pay deposit and wait for API call
    const [apiResponse] = await Promise.all([
      waitForApiResponse(page, '/api/checkout/deposit'),
      page.click('button[data-testid=pay-deposit]')
    ]);
    
    // Verify API was called with correct data
    expect(apiResponse.status()).toBe(200);
    
    // Wait for Stripe redirect
    await page.waitForURL('**/checkout.stripe.com/**');
    
    // Wait for success redirect
    await page.waitForURL('**/success**');
    
    // Verify success page
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Payment successful');
  });

  test('Package flow with add-ons', async ({ page }) => {
    await simulateStripeSuccess(page);
    
    await mockApiResponse(page, '**/api/checkout/package', {
      id: 'cs_test_package_123',
      url: 'https://checkout.stripe.com/test',
      client_secret: 'cs_test_package_123_secret'
    });

    await page.goto(`${BASE}/packages/bronze`);
    
    // Select add-on
    await page.check('input[name=addon_extra_hookah]');
    
    // Click buy package
    const [apiResponse] = await Promise.all([
      waitForApiResponse(page, '/api/checkout/package'),
      page.click('button[data-testid=buy-package]')
    ]);
    
    expect(apiResponse.status()).toBe(200);
    
    await page.waitForURL('**/checkout.stripe.com/**');
    await page.waitForURL('**/success**');
    
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Package purchased');
  });

  test('Terminal payment flow', async ({ page }) => {
    await mockApiResponse(page, '**/api/terminal/create-payment-intent', {
      id: 'pi_test_123',
      client_secret: 'pi_test_123_secret',
      amount: 8450,
      currency: 'usd',
      status: 'requires_payment_method'
    });

    await mockApiResponse(page, '**/api/terminal/connection-token', {
      secret: 'pst_test_123'
    });

    await page.goto(`${BASE}/terminal/closeout`);
    
    // Fill terminal form
    await page.fill('input[name=reservationId]', 'r_2025_09_10_1830_07');
    await page.fill('input[name=table]', 'T12');
    
    // Add items
    await page.click('button[data-testid=add-item]');
    await page.fill('input[name=item-name]', 'Hookah Mint');
    await page.fill('input[name=item-price]', '30.00');
    
    // Process payment
    const [apiResponse] = await Promise.all([
      waitForApiResponse(page, '/api/terminal/create-payment-intent'),
      page.click('button[data-testid=process-payment]')
    ]);
    
    expect(apiResponse.status()).toBe(200);
    
    // Verify success message
    await expect(page.locator('[data-testid="payment-success"]')).toContainText('Payment successful');
  });

  test('Error handling - API failure', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/checkout/deposit', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto(`${BASE}/reserve`);
    
    await page.fill('input[name=partySize]', '4');
    await page.click('button[data-testid=pay-deposit]');
    
    // Verify error message is shown
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Payment failed');
  });

  test('Error handling - Stripe cancellation', async ({ page }) => {
    await simulateStripeCancel(page);
    
    await mockApiResponse(page, '**/api/checkout/deposit', {
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/test',
      client_secret: 'cs_test_123_secret'
    });

    await page.goto(`${BASE}/reserve`);
    
    await page.fill('input[name=partySize]', '4');
    await page.click('button[data-testid=pay-deposit]');
    
    await page.waitForURL('**/checkout.stripe.com/**');
    await page.waitForURL('**/cancel**');
    
    await expect(page.locator('[data-testid="cancel-message"]')).toContainText('Payment cancelled');
  });
});
