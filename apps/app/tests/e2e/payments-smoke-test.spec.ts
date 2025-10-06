import { test, expect } from '@playwright/test';

test.describe('Payments Smoke Test Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('$1 Smoke Test - Complete Flow', async ({ page }) => {
    // Step 1: Navigate to fire session dashboard
    await page.goto('/fire-session-dashboard');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Look for $1 test button in header
    const testButton = page.locator('text=$1 Test').or(page.locator('button:has-text("$1 Test")'));
    await expect(testButton).toBeVisible();
    
    // Step 3: Click the $1 test button
    await testButton.click();
    
    // Step 4: Wait for API call and success response
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/payments/live-test') && response.status() === 200
    );
    
    const response = await responsePromise;
    const responseData = await response.json();
    
    // Step 5: Verify success message or status
    await expect(page.locator('text=Payment succeeded').or(page.locator('text=✅'))).toBeVisible();
    
    // Step 6: Check for payment intent ID in response
    expect(responseData.ok).toBe(true);
    expect(responseData.intentId).toBeDefined();
    expect(responseData.amount).toBe(100);
    
    // Step 7: Verify GhostLog entry was created
    const ghostLogResponse = await page.request.get('/api/ghost-log?kind=stripe_smoke_ok');
    expect(ghostLogResponse.ok()).toBeTruthy();
    
    const ghostLogData = await ghostLogResponse.json();
    expect(ghostLogData.logs).toBeDefined();
    expect(ghostLogData.logs.length).toBeGreaterThan(0);
    
    // Verify the log entry contains expected data
    const smokeTestLog = ghostLogData.logs.find((log: any) => log.kind === 'stripe_smoke_ok');
    expect(smokeTestLog).toBeDefined();
    expect(smokeTestLog.data.intentId).toBeDefined();
    expect(smokeTestLog.data.amount).toBe(100);
    
    // Step 8: Verify rate limiting headers
    expect(response.headers()['x-ratelimit-limit']).toBeDefined();
    expect(response.headers()['x-ratelimit-remaining']).toBeDefined();
  });

  test('$1 Smoke Test - Error Handling', async ({ page }) => {
    // Mock a failed API response
    await page.route('**/api/payments/live-test', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: false,
          error: 'Stripe API error',
          debug: { code: 'api_error' }
        })
      });
    });
    
    // Navigate to dashboard
    await page.goto('/fire-session-dashboard');
    
    // Click test button
    const testButton = page.locator('text=$1 Test').or(page.locator('button:has-text("$1 Test")'));
    await testButton.click();
    
    // Verify error message is displayed
    await expect(page.locator('text=error').or(page.locator('text=Failed')).or(page.locator('text=❌'))).toBeVisible();
  });

  test('$1 Smoke Test - Rate Limiting', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/fire-session-dashboard');
    
    const testButton = page.locator('text=$1 Test').or(page.locator('button:has-text("$1 Test")'));
    
    // Make multiple rapid requests to trigger rate limiting
    const promises = [];
    for (let i = 0; i < 6; i++) { // Exceed the 5 request limit
      promises.push(testButton.click());
      await page.waitForTimeout(100); // Small delay between clicks
    }
    
    // Wait for all requests to complete
    await Promise.all(promises);
    
    // Check for rate limit error message
    await expect(page.locator('text=Rate limit exceeded').or(page.locator('text=429'))).toBeVisible();
  });

  test('Session Management - Start Session', async ({ page }) => {
    // Navigate to fire session dashboard
    await page.goto('/fire-session-dashboard');
    
    // Look for create session button
    const createButton = page.locator('text=Create Session').or(page.locator('text=New Session')).or(page.locator('text=Start Session'));
    await createButton.first().click();
    
    // Fill in session details if modal appears
    const tableInput = page.locator('input[placeholder*="table"]').or(page.locator('input[name*="table"]'));
    if (await tableInput.count() > 0) {
      await tableInput.fill('T-01');
    }
    
    const customerInput = page.locator('input[placeholder*="customer"]').or(page.locator('input[name*="customer"]'));
    if (await customerInput.count() > 0) {
      await customerInput.fill('Test Customer');
    }
    
    // Submit session creation
    const submitButton = page.locator('button[type="submit"]').or(page.locator('text=Create')).or(page.locator('text=Start'));
    await submitButton.click();
    
    // Verify session was created
    await expect(page.locator('text=T-01').or(page.locator('text=Test Customer'))).toBeVisible();
  });

  test('RBAC - Role-based Actions', async ({ page }) => {
    // Navigate to fire session dashboard
    await page.goto('/fire-session-dashboard');
    
    // Check for role selector or role indicators
    const roleSelector = page.locator('[data-testid="role-selector"]').or(page.locator('text=Role:'));
    
    if (await roleSelector.count() > 0) {
      // Test different roles
      const roles = ['BOH', 'FOH', 'MANAGER', 'ADMIN'];
      
      for (const role of roles) {
        await page.click(`text=${role}`);
        await page.waitForTimeout(500);
        
        // Verify role-specific actions are visible
        const actions = page.locator(`[data-role="${role}"]`).or(page.locator(`text=${role} Actions`));
        await expect(actions).toBeVisible();
      }
    }
  });
});
