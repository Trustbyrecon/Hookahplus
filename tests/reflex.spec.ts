// tests/reflex.spec.ts
// Playwright tests for Reflex System

import { test, expect } from '@playwright/test';

test.describe('Reflex System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the admin panel
    await page.goto('/admin');
  });

  test('should not show reflective UI on payment routes', async ({ page }) => {
    // Test payment-related routes for absence of reflective UI
    const paymentRoutes = [
      '/checkout',
      '/payment',
      '/stripe',
      '/preorder'
    ];

    for (const route of paymentRoutes) {
      await page.goto(route);
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check that no reflex-related UI elements are visible
      const reflexElements = [
        '[data-testid="reflex-score"]',
        '[data-testid="reflex-alert"]',
        '[data-testid="reflex-monitor"]',
        '.reflex-score-indicator',
        '.reflex-alert',
        '.reflex-monitor'
      ];

      for (const selector of reflexElements) {
        const element = page.locator(selector);
        await expect(element).not.toBeVisible();
      }

      // Check that no reflex-related text is visible
      const reflexTexts = [
        'Reflex Score',
        'Gate Decision',
        'GhostLog',
        'Trust Graph',
        'Agent Performance'
      ];

      for (const text of reflexTexts) {
        const element = page.locator(`text=${text}`);
        await expect(element).not.toBeVisible();
      }
    }
  });

  test('should show reflex dashboard only on admin/reflex route', async ({ page }) => {
    // Navigate to reflex dashboard
    await page.goto('/admin/reflex');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that reflex UI elements are visible
    const reflexElements = [
      'text=Reflex System Dashboard',
      'text=Reflex Score',
      'text=System Health',
      'text=Agent Performance'
    ];

    for (const text of reflexElements) {
      const element = page.locator(text);
      await expect(element).toBeVisible();
    }
  });

  test('should enforce reflex score gates', async ({ page }) => {
    // Test API endpoints with reflex scoring
    const apiEndpoints = [
      '/api/events',
      '/api/badges',
      '/api/badges/export'
    ];

    for (const endpoint of apiEndpoints) {
      // Test with valid request
      const response = await page.request.post(endpoint, {
        data: {
          type: 'check_in',
          profileId: 'test_profile',
          venueId: 'test_venue'
        },
        headers: {
          'x-role': 'staff',
          'x-actor-id': 'test_staff',
          'x-venue-id': 'test_venue'
        }
      });

      // Check that response includes reflex score
      const responseData = await response.json();
      expect(responseData).toHaveProperty('reflexScore');
      expect(responseData).toHaveProperty('gateDecision');
      expect(responseData).toHaveProperty('confidence');
      
      // Check that reflex score is within valid range
      expect(responseData.reflexScore).toBeGreaterThanOrEqual(0);
      expect(responseData.reflexScore).toBeLessThanOrEqual(1);
    }
  });

  test('should log operations to GhostLog', async ({ page }) => {
    // Make API request that should be logged
    const response = await page.request.post('/api/events', {
      data: {
        type: 'check_in',
        profileId: 'test_profile',
        venueId: 'test_venue'
      },
      headers: {
        'x-role': 'staff',
        'x-actor-id': 'test_staff',
        'x-venue-id': 'test_venue'
      }
    });

    expect(response.ok()).toBeTruthy();

    // Check GhostLog entries
    const ghostLogResponse = await page.request.get('/api/reflex/entries?limit=10');
    const ghostLogData = await ghostLogResponse.json();
    
    expect(ghostLogData.success).toBeTruthy();
    expect(ghostLogData.data).toBeInstanceOf(Array);
    
    // Check that recent entry exists
    const recentEntry = ghostLogData.data.find((entry: any) => 
      entry.agentId === 'events_api_001' && 
      entry.action === 'POST /api/events'
    );
    expect(recentEntry).toBeDefined();
  });

  test('should show system health metrics', async ({ page }) => {
    // Navigate to reflex dashboard
    await page.goto('/admin/reflex');
    
    // Wait for system health to load
    await page.waitForSelector('[data-testid="system-health"]', { timeout: 10000 });
    
    // Check health metrics are displayed
    const healthElements = [
      'text=Overall Health',
      'text=Active Agents',
      'text=Critical Issues',
      'text=Trust Health'
    ];

    for (const text of healthElements) {
      const element = page.locator(text);
      await expect(element).toBeVisible();
    }
  });

  test('should handle reflex score thresholds correctly', async ({ page }) => {
    // Test different score scenarios
    const testCases = [
      { score: 0.95, expectedGate: 'proceed' },
      { score: 0.90, expectedGate: 'recover' },
      { score: 0.80, expectedGate: 'halt' }
    ];

    for (const testCase of testCases) {
      // Mock API response with specific score
      await page.route('/api/events', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { eventId: 'test_event' },
            reflexScore: testCase.score,
            gateDecision: testCase.expectedGate,
            confidence: 0.9
          })
        });
      });

      const response = await page.request.post('/api/events', {
        data: {
          type: 'check_in',
          profileId: 'test_profile'
        },
        headers: {
          'x-role': 'staff',
          'x-actor-id': 'test_staff'
        }
      });

      const responseData = await response.json();
      expect(responseData.gateDecision).toBe(testCase.expectedGate);
    }
  });

  test('should display reflex alerts for failures', async ({ page }) => {
    // Mock API response with failure
    await page.route('/api/events', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Operation halted by reflex system',
          reflexScore: 0.5,
          failures: ['serialization_error']
        })
      });
    });

    // Make request that will fail
    const response = await page.request.post('/api/events', {
      data: {
        type: 'check_in',
        profileId: 'test_profile'
      },
      headers: {
        'x-role': 'staff',
        'x-actor-id': 'test_staff'
      }
    });

    expect(response.status()).toBe(500);
    
    // Check that error response includes reflex information
    const responseData = await response.json();
    expect(responseData).toHaveProperty('reflexScore');
    expect(responseData).toHaveProperty('failures');
  });

  test('should update agent statistics in real-time', async ({ page }) => {
    // Navigate to reflex dashboard
    await page.goto('/admin/reflex');
    
    // Select specific agent
    await page.selectOption('select', 'badge_engine_001');
    
    // Wait for agent stats to load
    await page.waitForSelector('[data-testid="agent-stats"]', { timeout: 10000 });
    
    // Check that agent-specific metrics are displayed
    const agentElements = [
      'text=Total Operations',
      'text=Success Rate',
      'text=Average Score'
    ];

    for (const text of agentElements) {
      const element = page.locator(text);
      await expect(element).toBeVisible();
    }
  });
});
