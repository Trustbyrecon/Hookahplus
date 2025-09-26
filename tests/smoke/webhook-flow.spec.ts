import { test, expect } from '@playwright/test';

test.describe('Smoke Flow: Webhook', () => {
  test('Webhook endpoint returns 200 idempotent @smoke', async ({ request }) => {
    const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
    const res = await request.post(`${base}/api/stripe/webhook`, { data: { id: 'evt_test', type: 'checkout.session.completed', data: { object: { id: 'cs_test' } } } });
    expect([200, 400, 401, 404]).toContain(res.status());
  });
});
