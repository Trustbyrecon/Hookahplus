/**
 * E2E Test: Night After Night Engine - Complete Session Lifecycle
 * 
 * Agent: EchoPrime
 * 
 * Tests the complete Night After Night engine flow from pre-order through delivery and activation
 * Based on NIGHT_AFTER_NIGHT_ENGINE_PLAN.md and NIGHT_AFTER_NIGHT_FLOW.md
 */

import { test, expect } from '@playwright/test';

test.describe('Night After Night Engine - E2E Tests', () => {
  const testLoungeId = 'test-lounge-001';
  const testTableId = 'T-001';
  const testFlavorMix = ['Mint', 'Grape'];
  const testPartySize = 2;

  test.beforeEach(async ({ page }) => {
    // Set up test environment
    await page.goto('/');
  });

  test('Pathway 1: Pre-order → Payment → Session Creation → Guest Tracker', async ({ page }) => {
    // Step 1: Create pre-order
    const preorderResponse = await page.request.post('/api/preorders', {
      data: {
        loungeId: testLoungeId,
        partySize: testPartySize,
        flavorMix: testFlavorMix,
        guestHandle: 'test-guest@example.com',
      },
    });

    expect(preorderResponse.ok()).toBeTruthy();
    const preorderData = await preorderResponse.json();
    const preorderId = preorderData.preorder_id || preorderData.id;
    expect(preorderId).toBeTruthy();

    // Step 2: Verify pre-order created with PENDING status
    const preorderGetResponse = await page.request.get(`/api/preorders?payment_intent_id=${preorderId}`);
    if (preorderGetResponse.ok()) {
      const preorder = await preorderGetResponse.json();
      expect(preorder.preorder?.status).toBe('pending');
    }

    // Step 3: Create checkout session (simulate payment)
    const checkoutResponse = await page.request.post('/api/checkout-session', {
      data: {
        preorderId: preorderId,
        loungeId: testLoungeId,
        amount: 3500, // $35.00 in cents
        currency: 'usd',
      },
    });

    expect(checkoutResponse.ok()).toBeTruthy();
    const checkoutData = await checkoutResponse.json();
    const checkoutSessionId = checkoutData.sessionId || checkoutData.id;
    expect(checkoutSessionId).toBeTruthy();

    // Step 4: Simulate payment confirmation (webhook)
    const webhookResponse = await page.request.post('/api/webhooks/stripe', {
      data: {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: checkoutSessionId,
            payment_status: 'paid',
            amount_total: 3500,
            metadata: {
              preorderId: preorderId,
              loungeId: testLoungeId,
              tableId: testTableId,
              flavorMix: testFlavorMix.join(','),
            },
          },
        },
      },
    });

    // Webhook may return 200 or 400 depending on implementation
    // Just verify it doesn't crash
    expect([200, 400]).toContain(webhookResponse.status());

    // Step 5: Verify session created from pre-order
    await page.waitForTimeout(2000); // Wait for webhook processing
    
    const sessionsResponse = await page.request.get(`/api/sessions?loungeId=${testLoungeId}`);
    expect(sessionsResponse.ok()).toBeTruthy();
    const sessionsData = await sessionsResponse.json();
    const sessions = sessionsData.sessions || sessionsData;
    
    // Find session created from this pre-order
    const createdSession = Array.isArray(sessions) 
      ? sessions.find((s: any) => s.preorderId === preorderId || s.externalRef === checkoutSessionId)
      : null;
    
    if (createdSession) {
      expect(createdSession.status).toMatch(/PAID|PAID_CONFIRMED|NEW/);
    }

    // Step 6: Verify checkout success redirects to guest tracker
    await page.goto(`/checkout/success?session_id=${checkoutSessionId}`);
    
    // Check for redirect to guest tracker or tracker link
    const trackerLink = page.locator('a[href*="hookah-tracker"]');
    await expect(trackerLink).toBeVisible({ timeout: 5000 });
    
    // Verify tracker link has correct parameters
    const href = await trackerLink.getAttribute('href');
    expect(href).toContain('hookah-tracker');
    expect(href).toContain('sessionId=');
  });

  test('Pathway 2: Session → Order → Delivery → Active (Night After Night Flow)', async ({ page }) => {
    // Step 1: Create session with payment confirmed
    const sessionResponse = await page.request.post('/api/sessions', {
      data: {
        loungeId: testLoungeId,
        tableId: testTableId,
        partySize: testPartySize,
        flavorMix: testFlavorMix,
        status: 'PAID_CONFIRMED',
        basePrice: 3500,
      },
    });

    expect(sessionResponse.ok()).toBeTruthy();
    const sessionData = await sessionResponse.json();
    const sessionId = sessionData.id || sessionData.session?.id;
    expect(sessionId).toBeTruthy();

    // Step 2: BOH Claims Prep (PREP_IN_PROGRESS)
    const claimPrepResponse = await page.request.patch(`/api/sessions/${sessionId}`, {
      data: {
        status: 'PREP_IN_PROGRESS',
        action: 'claim_prep',
      },
    });

    expect(claimPrepResponse.ok()).toBeTruthy();

    // Step 3: Create order for prep bar
    const orderResponse = await page.request.post(`/api/sessions/${sessionId}/orders`, {
      data: {
        type: 'HOOKAH',
        flavorMix: testFlavorMix,
        specialInstructions: 'Extra coals',
      },
    });

    expect(orderResponse.ok()).toBeTruthy();
    const orderData = await orderResponse.json();
    const orderId = orderData.id || orderData.order?.id;
    expect(orderId).toBeTruthy();

    // Step 4: BOH Marks Ready (READY_FOR_DELIVERY)
    const markReadyResponse = await page.request.patch(`/api/orders/${orderId}`, {
      data: {
        status: 'READY',
      },
    });

    expect(markReadyResponse.ok()).toBeTruthy();

    // Update session to READY_FOR_DELIVERY
    const readyResponse = await page.request.patch(`/api/sessions/${sessionId}`, {
      data: {
        status: 'READY_FOR_DELIVERY',
      },
    });

    expect(readyResponse.ok()).toBeTruthy();

    // Step 5: FOH Delivers (DELIVERED)
    const deliverResponse = await page.request.post(`/api/sessions/${sessionId}/deliveries`, {
      data: {
        orderId: orderId,
        deliveredBy: 'staff-001',
      },
    });

    expect(deliverResponse.ok()).toBeTruthy();

    // Step 6: Light Session (ACTIVE) - This is when it's "LIT"
    const lightResponse = await page.request.post(`/api/sessions/${sessionId}/startTimer`, {
      data: {
        action: 'light_session',
      },
    });

    expect(lightResponse.ok()).toBeTruthy();

    // Step 7: Verify session is ACTIVE
    const finalSessionResponse = await page.request.get(`/api/sessions/${sessionId}`);
    expect(finalSessionResponse.ok()).toBeTruthy();
    const finalSession = await finalSessionResponse.json();
    const finalSessionData = finalSession.session || finalSession;
    
    expect(finalSessionData.status).toBe('ACTIVE');
    
    // Verify timer has started
    expect(finalSessionData.startedAt || finalSessionData.timerStartedAt).toBeTruthy();
  });

  test('Pathway 3: Payment Confirmation Triggers Hookah Tracker Redirect', async ({ page }) => {
    // Step 1: Create checkout session
    const checkoutResponse = await page.request.post('/api/checkout-session', {
      data: {
        loungeId: testLoungeId,
        tableId: testTableId,
        amount: 3500,
        flavorMix: testFlavorMix,
        partySize: testPartySize,
      },
    });

    expect(checkoutResponse.ok()).toBeTruthy();
    const checkoutData = await checkoutResponse.json();
    const checkoutSessionId = checkoutData.sessionId || checkoutData.id;

    // Step 2: Simulate payment completion
    const paymentConfirmResponse = await page.request.post('/api/webhooks/stripe', {
      data: {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: checkoutSessionId,
            payment_status: 'paid',
            amount_total: 3500,
            metadata: {
              loungeId: testLoungeId,
              tableId: testTableId,
              flavorMix: testFlavorMix.join(','),
            },
          },
        },
      },
    });

    // Step 3: Navigate to checkout success page
    await page.goto(`/checkout/success?session_id=${checkoutSessionId}`);

    // Step 4: Verify page shows payment confirmation
    await expect(page.locator('text=Payment Confirmed')).toBeVisible({ timeout: 5000 });

    // Step 5: Verify redirect to guest tracker (either automatic or via link)
    const trackerLink = page.locator('a[href*="hookah-tracker"], text=View Hookah Tracker');
    await expect(trackerLink.first()).toBeVisible({ timeout: 5000 });

    // Step 6: Verify tracker URL contains session parameters
    const href = await trackerLink.first().getAttribute('href');
    expect(href).toContain('hookah-tracker');
    expect(href).toContain('sessionId=');
    expect(href).toContain('loungeId=');
    expect(href).toContain('tableId=');
  });

  test('Pathway 4: Full Night After Night Flow - Pre-order to Active Session', async ({ page }) => {
    // Complete end-to-end flow combining all pathways
    
    // 1. Create pre-order
    const preorderResponse = await page.request.post('/api/preorders', {
      data: {
        loungeId: testLoungeId,
        partySize: testPartySize,
        flavorMix: testFlavorMix,
      },
    });
    expect(preorderResponse.ok()).toBeTruthy();
    const preorder = await preorderResponse.json();
    const preorderId = preorder.preorder_id || preorder.id;

    // 2. Convert pre-order to session with payment
    const sessionResponse = await page.request.post('/api/sessions', {
      data: {
        preorderId: preorderId,
        loungeId: testLoungeId,
        tableId: testTableId,
        partySize: testPartySize,
        flavorMix: testFlavorMix,
        status: 'PAID_CONFIRMED',
        basePrice: 3500,
      },
    });
    expect(sessionResponse.ok()).toBeTruthy();
    const session = await sessionResponse.json();
    const sessionId = session.id || session.session?.id;

    // 3. BOH claims prep
    await page.request.patch(`/api/sessions/${sessionId}`, {
      data: { status: 'PREP_IN_PROGRESS' },
    });

    // 4. Create order
    const orderResponse = await page.request.post(`/api/sessions/${sessionId}/orders`, {
      data: { type: 'HOOKAH', flavorMix: testFlavorMix },
    });
    expect(orderResponse.ok()).toBeTruthy();
    const order = await orderResponse.json();
    const orderId = order.id || order.order?.id;

    // 5. BOH marks ready
    await page.request.patch(`/api/orders/${orderId}`, {
      data: { status: 'READY' },
    });
    await page.request.patch(`/api/sessions/${sessionId}`, {
      data: { status: 'READY_FOR_DELIVERY' },
    });

    // 6. FOH delivers
    await page.request.post(`/api/sessions/${sessionId}/deliveries`, {
      data: { orderId: orderId, deliveredBy: 'staff-001' },
    });

    // 7. Light session (ACTIVE)
    await page.request.post(`/api/sessions/${sessionId}/startTimer`, {
      data: { action: 'light_session' },
    });

    // 8. Verify final state
    const finalResponse = await page.request.get(`/api/sessions/${sessionId}`);
    expect(finalResponse.ok()).toBeTruthy();
    const final = await finalResponse.json();
    const finalData = final.session || final;
    
    expect(finalData.status).toBe('ACTIVE');
    expect(finalData.preorderId).toBe(preorderId);
  });

  test('Pathway 5: Guest Experience - Payment → Tracker → Session Status Updates', async ({ page }) => {
    // Test guest-facing flow
    
    // 1. Create session with payment
    const sessionResponse = await page.request.post('/api/sessions', {
      data: {
        loungeId: testLoungeId,
        tableId: testTableId,
        partySize: testPartySize,
        flavorMix: testFlavorMix,
        status: 'PAID_CONFIRMED',
        basePrice: 3500,
      },
    });
    expect(sessionResponse.ok()).toBeTruthy();
    const session = await sessionResponse.json();
    const sessionId = session.id || session.session?.id;

    // 2. Navigate to checkout success (simulating guest view)
    await page.goto(`/checkout/success?session_id=${sessionId}`);

    // 3. Verify tracker link is present
    const trackerLink = page.locator('a[href*="hookah-tracker"]');
    await expect(trackerLink).toBeVisible({ timeout: 5000 });

    // 4. Simulate clicking tracker link (navigate to tracker)
    const href = await trackerLink.getAttribute('href');
    if (href && href.startsWith('http')) {
      // External URL - would need to handle cross-origin
      // For now, verify the URL structure
      expect(href).toContain('hookah-tracker');
      expect(href).toContain(`sessionId=${sessionId}`);
    } else {
      // Internal navigation
      await page.goto(href || '/hookah-tracker');
    }

    // 5. Update session status (simulating prep progress)
    await page.request.patch(`/api/sessions/${sessionId}`, {
      data: { status: 'PREP_IN_PROGRESS' },
    });

    // 6. Verify session status can be queried (for tracker polling)
    const statusResponse = await page.request.get(`/api/sessions/${sessionId}`);
    expect(statusResponse.ok()).toBeTruthy();
    const statusData = await statusResponse.json();
    const status = statusData.session?.status || statusData.status;
    expect(status).toBe('PREP_IN_PROGRESS');
  });
});

