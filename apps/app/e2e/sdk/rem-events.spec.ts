/**
 * E2E Test: SDK REM Events
 * 
 * Agent: EchoPrime
 * Objective: O5.4 - Test Suites
 */

import { test, expect } from '@playwright/test';

test.describe('SDK REM Events E2E', () => {
  test('Track REM event via API', async ({ page }) => {
    const response = await page.request.post('/api/reflex/track', {
      data: {
        type: 'order.created',
        source: 'test',
        sessionId: 'test-session-sdk-001',
        payload: {
          actor: {
            anon_hash: 'sha256:test123',
          },
          effect: {
            loyalty_delta: 5.0,
            credit_type: 'HPLUS_CREDIT',
          },
          security: {
            signature: 'ed25519:test',
          },
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.remFormat).toBe(true);
    expect(data.trustEventId).toBeDefined();
  });

  test('Verify REM event format compliance', async ({ page }) => {
    const response = await page.request.post('/api/reflex/track', {
      data: {
        type: 'payment.settled',
        source: 'test',
        sessionId: 'test-session-sdk-002',
        paymentIntent: 'pi_test_123',
        payload: {
          actor: {
            anon_hash: 'sha256:test456',
            customer_id: 'CUST-001',
          },
          effect: {
            loyalty_delta: 10.0,
            credit_type: 'HPLUS_CREDIT',
            revenue_delta: 5000,
          },
          security: {
            signature: 'ed25519:test',
          },
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.remFormat).toBe(true);
    expect(data.trustEventId).toMatch(/^TE-\d{4}-\d+$/);
  });
});

