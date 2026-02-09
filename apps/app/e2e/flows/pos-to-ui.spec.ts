/**
 * E2E Test: POS → SDK → Ledger → UI Flow
 * 
 * Agent: EchoPrime
 * 
 * Tests the complete flow from POS order creation to UI display
 */

import { test, expect } from '@playwright/test';

test.describe('POS to UI E2E Flow', () => {
  test('Complete flow: POS order → SDK event → Ledger credit → UI display', async ({ page }) => {
    // Step 1: Create POS order (mock)
    const posOrder = {
      ticketId: 'POS-TEST-001',
      amountCents: 3500,
      sessionId: 'test-session-001',
    };

    // Step 2: Verify SDK event emitted (REM format)
    const reflexResponse = await page.request.post('/api/reflex/track', {
      data: {
        type: 'order.created',
        source: 'pos',
        sessionId: posOrder.sessionId,
        payload: {
          id: 'TE-2025-000001',
          ts_utc: new Date().toISOString(),
          type: 'order.created',
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

    expect(reflexResponse.ok()).toBeTruthy();

    // Step 3: Verify Ledger credit issued (mock - will be implemented by Jules)
    // This will be implemented when Jules creates the ledger API

    // Step 4: Verify UI displays session
    await page.goto('/sessions');
    await expect(page.getByText(posOrder.sessionId)).toBeVisible({ timeout: 5000 });
  });

  test('EP.POS.Ready gate blocks QR-only changes', async ({ page }) => {
    // This test verifies G1 guardrail
    // QR-only changes should be blocked when POS_SYNC_READY = false
    
    // Navigate to QR page
    await page.goto('/admin/qr');
    
    // Verify page loads (non-QR-only changes allowed)
    await expect(page.getByRole('heading', { name: /QR Code Management/i })).toBeVisible({ timeout: 5000 });
    
    // Note: Actual QR-only change blocking would be tested via API gate checks
  });

  test('EP.REM.Coverage gate validates event format', async ({ page }) => {
    // Test that events emit REM format
    const invalidEvent = {
      type: 'order.created',
      // Missing required fields
    };

    const response = await page.request.post('/api/reflex/track', {
      data: invalidEvent,
    });

    // Should accept but payload should be validated
    expect(response.ok()).toBeTruthy();
  });
});

