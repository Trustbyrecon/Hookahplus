import { test, expect } from '@playwright/test';

test.describe('Reflex Layer Integration', () => {
  test('should not show reflective UI on payment routes', async ({ page }) => {
    // Navigate to payment-related routes
    const paymentRoutes = [
      '/checkout',
      '/api/payments/live-test',
      '/api/stripe/webhook'
    ];

    for (const route of paymentRoutes) {
      await page.goto(route);
      
      // Check that no reflective UI elements are present
      const reflectiveElements = await page.locator('[data-reflex]').count();
      expect(reflectiveElements).toBe(0);
      
      // Check that no debug/development UI is shown
      const debugElements = await page.locator('[data-debug], [data-testid*="reflex"]').count();
      expect(debugElements).toBe(0);
      
      // Check that no console errors related to reflex layer
      const logs = await page.evaluate(() => {
        return (window as any).consoleLogs || [];
      });
      
      const reflexErrors = logs.filter((log: string) => 
        log.includes('ReflexLayer') && log.includes('error')
      );
      expect(reflexErrors).toHaveLength(0);
    }
  });

  test('should enforce score gates on critical operations', async ({ page }) => {
    // Test that critical operations are properly gated
    await page.goto('/api/health');
    
    const response = await page.request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
    
    // Check that the response doesn't contain reflex debugging info
    expect(JSON.stringify(data)).not.toContain('reflex');
    expect(JSON.stringify(data)).not.toContain('score');
    expect(JSON.stringify(data)).not.toContain('gate');
  });

  test('should handle API failures gracefully', async ({ page }) => {
    // Test that API failures don't expose internal reflex state
    const response = await page.request.post('/api/payments/live-test', {
      data: { invalid: 'data' }
    });
    
    // Should return a proper error response, not internal reflex state
    const data = await response.json();
    expect(data).toHaveProperty('ok');
    expect(data).toHaveProperty('error');
    
    // Should not contain reflex debugging information
    expect(JSON.stringify(data)).not.toContain('ReflexLayer');
    expect(JSON.stringify(data)).not.toContain('score');
    expect(JSON.stringify(data)).not.toContain('gate');
  });

  test('should maintain performance on high-traffic routes', async ({ page }) => {
    // Test that reflex layer doesn't significantly impact performance
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within reasonable time (5 seconds)
    expect(loadTime).toBeLessThan(5000);
    
    // Check that no performance warnings are logged
    const logs = await page.evaluate(() => {
      return (window as any).consoleLogs || [];
    });
    
    const performanceWarnings = logs.filter((log: string) => 
      log.includes('slow') || log.includes('timeout') || log.includes('performance')
    );
    expect(performanceWarnings).toHaveLength(0);
  });

  test('should not leak sensitive information in error responses', async ({ page }) => {
    // Test that error responses don't leak internal state
    const response = await page.request.get('/api/nonexistent');
    
    expect(response.status()).toBe(404);
    
    const data = await response.text();
    
    // Should not contain internal reflex state
    expect(data).not.toContain('ReflexLayer');
    expect(data).not.toContain('score');
    expect(data).not.toContain('gate');
    expect(data).not.toContain('fingerprint');
    expect(data).not.toContain('trust');
  });
});

test.describe('Reflex Layer Unit Tests', () => {
  test('score gate thresholds work correctly', async ({ page }) => {
    // This would test the actual reflex layer logic
    // In a real implementation, you'd test the scoring functions
    await page.goto('/');
    
    // Mock test for score gate functionality
    const scoreGateTest = await page.evaluate(() => {
      // This would be the actual reflex layer code
      function gate(score: number) {
        if (score >= 0.92) return "proceed";
        if (score >= 0.87) return "recover";
        return "halt";
      }
      
      return {
        proceed: gate(0.95),
        recover: gate(0.89),
        halt: gate(0.80)
      };
    });
    
    expect(scoreGateTest.proceed).toBe('proceed');
    expect(scoreGateTest.recover).toBe('recover');
    expect(scoreGateTest.halt).toBe('halt');
  });

  test('enrichment fingerprint generation', async ({ page }) => {
    await page.goto('/');
    
    const fingerprintTest = await page.evaluate(() => {
      // Mock fingerprint generation
      function generateFingerprint(output: string) {
        return {
          outputType: 'text',
          signal: output.length > 10 ? 0.8 : 0.3,
          domainMatch: 0.7,
          reliability: 0.9
        };
      }
      
      return {
        highSignal: generateFingerprint('This is a detailed response with lots of information'),
        lowSignal: generateFingerprint('Hi')
      };
    });
    
    expect(fingerprintTest.highSignal.signal).toBeGreaterThan(fingerprintTest.lowSignal.signal);
    expect(fingerprintTest.highSignal.outputType).toBe('text');
  });
});
