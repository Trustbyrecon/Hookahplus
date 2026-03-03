import { test, expect } from '@playwright/test';

test.describe('Guest App - $1 Smoke Test Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the guest app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('$1 Test Button - Proxy to App API', async ({ page }) => {
    // Step 1: Look for $1 test button
    const testButton = page.locator('text=Run $1 Stripe test').or(page.locator('button:has-text("$1")'));
    await expect(testButton).toBeVisible();
    
    // Step 2: Click the $1 test button
    await testButton.click();
    
    // Step 3: Wait for API call to App
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/payments/live-test') && response.status() === 200
    );
    
    const response = await responsePromise;
    const responseData = await response.json();
    
    // Step 4: Verify success message
    await expect(page.locator('text=✅').or(page.locator('text=Succeeded'))).toBeVisible();
    
    // Step 5: Verify response data
    expect(responseData.ok).toBe(true);
    expect(responseData.message).toBeDefined();
    
    // Step 6: Verify rate limiting headers
    expect(response.headers()['x-ratelimit-limit']).toBeDefined();
    expect(response.headers()['x-ratelimit-remaining']).toBeDefined();
  });

  test('$1 Test - Fallback Stripe Integration', async ({ page }) => {
    // Mock App API failure to test fallback
    await page.route('**/api/payments/live-test', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: false,
          error: 'App API unavailable'
        })
      });
    });
    
    // Click test button
    const testButton = page.locator('text=$1 Test').or(page.locator('text=Test Payment'));
    await testButton.first().click();
    
    // Should fall back to local Stripe integration
    await expect(page.locator('text=Stripe $1 test succeeded').or(page.locator('text=fallback'))).toBeVisible();
  });

  test('Pre-order Flow - Table Selection', async ({ page }) => {
    // Look for pre-order or table selection
    const preOrderButton = page.locator('text=Pre-order').or(page.locator('text=Order Now')).or(page.locator('text=Select Table'));
    
    if (await preOrderButton.count() > 0) {
      await preOrderButton.first().click();
      
      // Look for table selection
      const tableSelector = page.locator('[data-testid="table-selector"]').or(page.locator('text=Table'));
      
      if (await tableSelector.count() > 0) {
        // Select a table
        const tableOption = page.locator('text=T-01').or(page.locator('text=Table 1')).or(page.locator('[data-table="T-01"]'));
        await tableOption.first().click();
        
        // Verify table selection
        await expect(page.locator('text=T-01').or(page.locator('text=Table 1'))).toBeVisible();
      }
    }
  });

  test('Navigation - Cross-app Links', async ({ page }) => {
    // Look for links to App or Site
    const appLink = page.locator('text=Staff Dashboard').or(page.locator('text=Admin')).or(page.locator('[href*="app"]'));
    const siteLink = page.locator('text=Home').or(page.locator('text=About')).or(page.locator('[href*="site"]'));
    
    if (await appLink.count() > 0) {
      await appLink.first().click();
      // Should navigate to app (this would be tested in integration)
      await page.waitForTimeout(1000);
    }
    
    if (await siteLink.count() > 0) {
      await siteLink.first().click();
      // Should navigate to site
      await page.waitForTimeout(1000);
    }
  });

  test('Error Handling - Network Issues', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    // Try to perform actions that require API calls
    const testButton = page.locator('text=$1 Test').or(page.locator('text=Test Payment'));
    
    if (await testButton.count() > 0) {
      await testButton.first().click();
      
      // Should show error message
      await expect(page.locator('text=error').or(page.locator('text=Failed')).or(page.locator('text=❌'))).toBeVisible();
    }
  });
});
